# Dashboard — Contexto del módulo

## Propósito

Pantalla de inicio (ruta `/`, index de `HomeView`). Muestra tarjetas KPI por módulo de inventario con actividad de los últimos 7 días, sparkline de tendencia y métricas secundarias. Solo se muestran los módulos para los que el usuario tiene permiso. Opcionalmente se puede filtrar por sucursal.

---

## Rutas

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/v1/dashboard/kpis` | KPIs filtrados por permisos. `?sucursalId=N` opcional |
| GET | `/api/v1/dashboard/sucursales` | Sucursales accesibles por el usuario (para el selector) |

---

## Módulos que aparecen en el dashboard

| Módulo (clave) | URL de permiso | Tabla BD |
|---|---|---|
| `ORDEN_ENTRADA` | `/inventario/orden-entrada` | `inventario.in_orden_entrada` |
| `ORDEN_COMPRA` | `/inventario/orden-compra` | `inventario.in_ordenes_compras` |
| `REQUISICION` | `/inventario/requisicion` | `inventario.in_requisicion` |
| `TRANSFERENCIA` | `/inventario/transferencias` | `inventario.in_transferencias` |

Agregar un nuevo módulo requiere: añadir una entrada en `DashboardDao/DashboardDaoImpl`, registrar la URL en `DashboardServiceImpl.getKpis()`, y añadir la configuración de color/icono en `MODULO_CONFIG` en el frontend.

---

## Estados por módulo

| Tabla | Estados relevantes |
|---|---|
| `in_orden_entrada` | `PEN` (pendiente), `ACT` (completada), `INA` (inactiva — excluida de conteos) |
| `in_ordenes_compras` | `ACT` (abierta), `INA` (cancelada) |
| `in_requisicion` | `PEN`, `PEN_APR` (pendiente aprobación), `APR` (aprobada), `COM` (completada) |
| `in_transferencias` | `PEN` (en tránsito), `COM` (completada), `INA` (excluida de conteos) |

---

## Filtro por sucursal

- Por defecto (`sucursalId = null`) los datos son **empresa-wide** (sin filtro de sucursal).
- El selector de sucursal solo se muestra si el usuario tiene acceso a **más de una** sucursal.
- El selector se puebla con `GET /api/v1/dashboard/sucursales` que devuelve solo las sucursales donde el usuario tiene al menos un rol activo en la empresa actual.
- Los permisos de módulo se verifican **siempre** contra la sucursal del JWT (`TenantContext.getCurrentSucursalId()`), independientemente del filtro de sucursal elegido.

---

## Archivos backend

```
dto/inventario/DashboardKpiDTO.java          — @Builder: modulo, titulo, total, labelTotal,
                                               pendientes, labelPendientes, completadas,
                                               labelCompletadas, tendencia List<DashboardTendenciaDTO>
dto/inventario/DashboardTendenciaDTO.java    — dia (String "DD/MM"), total (long)
dto/inventario/DashboardSucursalDTO.java     — id (Integer), nombre (String)

dao/inventario/DashboardDao.java             — interfaz; 4 métodos kpi*(empresaId, sucursalId)
dao/inventario/DashboardDaoImpl.java         — SQL nativo con generate_series; helpers privados
                                               count() y tendencia7Dias(); sucursalId nullable →
                                               añade "AND sucursal_id = :sucursalId" solo si != null
interfaces/inventario/DashboardService.java  — getKpis(Integer sucursalId), getSucursales()
services/inventario/DashboardServiceImpl.java — lee TenantContext; verifica permisos con
                                               SgPermisoRepository.findMenuUrlsPermitidas();
                                               puebla sucursales con
                                               SgUsuarioRolRepository.findSucursalesByUsernameAndEmpresa()
controllers/inventario/DashboardController.java — GET /kpis?sucursalId=, GET /sucursales
```

---

## Archivos frontend

```
src/apis/DashboardController.tsx             — getDashboardKpis(sucursalId?), getDashboardSucursales()
                                               Interfaces: DashboardKpiDTO, DashboardTendenciaDTO,
                                               DashboardSucursalDTO
src/components/shared/DashboardView.tsx      — KpiCard (sparkline AreaChart + métricas secundarias)
                                               DashboardView (selector de sucursal + Grid de cards)
```

---

## Paleta y configuración visual (MODULO_CONFIG)

```typescript
ORDEN_ENTRADA: { color: "#525C71",  icon: MoveToInboxIcon   }
ORDEN_COMPRA:  { color: "#3D4453",  icon: ShoppingCartIcon  }
REQUISICION:   { color: "#B45309",  icon: AssignmentIcon    }   // ámbar — llama la atención
TRANSFERENCIA: { color: "#67748F",  icon: CompareArrowsIcon }
```

- El sparkline usa `recharts` `AreaChart` con gradiente de opacidad 25 % → 2 %.
- La tendencia (↑ verde / ↓ rojo) compara el primer y último punto del sparkline (`spark[0].total` vs `spark[last].total`).
- El selector de sucursal solo se renderiza cuando `sucursales.length > 1`.
- Mientras carga (re-fetch por cambio de sucursal) se muestra `CircularProgress` en el área del grid, no en toda la pantalla.

---

## Queries SQL clave

### Sparkline 7 días (generate_series)
```sql
WITH dias AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS dia
),
conteos AS (
  SELECT DATE(fecha_reg) AS dia, COUNT(*) AS total
  FROM inventario.<tabla>
  WHERE empresa_id = :empresaId
    [AND sucursal_id = :sucursalId]   -- solo si sucursalId != null
    AND fecha_reg >= CURRENT_DATE - INTERVAL '6 days'
    AND estado_id != 'INA'
  GROUP BY DATE(fecha_reg)
)
SELECT TO_CHAR(d.dia, 'DD/MM') AS dia, COALESCE(c.total, 0) AS total
FROM dias d LEFT JOIN conteos c ON c.dia = d.dia
ORDER BY d.dia
```

### COUNT helper
```sql
SELECT COUNT(*) FROM inventario.<tabla>
WHERE empresa_id = :empresaId
  [AND sucursal_id = :sucursalId]
  <whereExtra>
```

---

## Gráfica de ajustes de inventario (bar chart horizontal)

Sección independiente del grid de KPI cards. Muestra el conteo de ajustes de los últimos 7 días agrupado por tipo de movimiento.

### Tipos incluidos
| `movimiento_tipo_id` | Descripción (de `in_movimientos_tipos`) |
|---|---|
| 4 | (según catálogo) |
| 5 | (según catálogo) |
| 9 | (según catálogo) |
| 20 | (según catálogo) |

- Excluye ajustes con `estado_id = 'ANU'`.
- Siempre retorna los 4 tipos aunque tengan 0 (LEFT JOIN vía CTE `unnest`).
- Respeta el filtro de sucursal del selector existente.

### Endpoint
`GET /api/v1/dashboard/ajustes?sucursalId=N` (sucursalId opcional)

Devuelve `List<DashboardAjusteBarDTO>`:
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class DashboardAjusteBarDTO {
  private Integer tipoId;
  private String tipoNombre;   // leído de in_movimientos_tipos.tipo_movimiento
  private long total;
}
```

### Query SQL (nativa)
```sql
WITH tipos AS (
  SELECT unnest(ARRAY[4, 5, 9, 20]) AS tipo_id
),
conteos AS (
  SELECT a.movimiento_tipo_id, COUNT(*) AS total
  FROM inventario.in_ajuste_inventario a
  WHERE a.empresa_id = :empresaId
    [AND a.sucursal_id = :sucursalId]
    AND a.movimiento_tipo_id IN (4, 5, 9, 20)
    AND a.fecha_reg >= CURRENT_DATE - INTERVAL '6 days'
    AND a.estado_id != 'ANU'
  GROUP BY a.movimiento_tipo_id
)
SELECT t.tipo_id, mt.tipo_movimiento, COALESCE(c.total, 0) AS total
FROM tipos t
JOIN inventario.in_movimientos_tipos mt ON mt.id = t.tipo_id
LEFT JOIN conteos c ON c.movimiento_tipo_id = t.tipo_id
ORDER BY t.tipo_id
```

### Archivos involucrados
```
dto/inventario/DashboardAjusteBarDTO.java
dao/inventario/DashboardDao.java              — método kpiAjustesPorTipo()
dao/inventario/DashboardDaoImpl.java          — implementación SQL nativo
interfaces/inventario/DashboardService.java   — método getAjustesPorTipo()
services/inventario/DashboardServiceImpl.java — lee TenantContext, delega al DAO
controllers/inventario/DashboardController.java — GET /ajustes
```

### Frontend
- `DashboardController.tsx`: interface `DashboardAjusteBarDTO` + función `getDashboardAjustes(sucursalId?)`
- `DashboardView.tsx`: componente `AjustesBarChart` — `BarChart layout="vertical"` de recharts con `Cell` por tipo usando la paleta monocromática. Se oculta si no hay datos. Carga junto a los KPIs con `Promise.all`.
- Paleta de barras: `["#525C71", "#3D4453", "#67748F", "#848EA5"]` (índice por posición en el array).

---

## Extensibilidad

Para agregar un nuevo módulo KPI:

1. **DAO**: añadir método `kpiNuevoModulo(Integer empresaId, Integer sucursalId)` en `DashboardDao` e implementarlo en `DashboardDaoImpl` siguiendo el mismo patrón de `count()` + `tendencia7Dias()`.
2. **Service**: agregar `if (urls.contains("/ruta/del/modulo")) result.add(dashboardDao.kpiNuevoModulo(...))`.
3. **Frontend `MODULO_CONFIG`**: añadir la clave, color e ícono MUI correspondiente.
4. No se requieren cambios en el controller ni en el DTO.
