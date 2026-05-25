# Módulo de Requisiciones de Transferencia — Contexto técnico

## Propósito

Permite a un almacén solicitar productos de otro almacén.
Flujo de estados: `PEN → APR/REC → COM/ANU`

---

## Base de datos (PostgreSQL, schema `inventario`)

### `inventario.in_requisicion`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Clave interna |
| `secuencia` | INTEGER | Número visible por empresa (generado con `mg_secuencias`) |
| `empresa_id` | INTEGER | Tenant |
| `sucursal_id` | INTEGER FK → `seguridad.sg_sucursales(id)` | Sucursal del tenant |
| `almacen_solicitante_id` | INTEGER FK → `inventario.in_almacenes(id)` | Almacén que solicita |
| `almacen_origen_id` | INTEGER FK → `inventario.in_almacenes(id)` | Almacén que provee |
| `prioridad` | VARCHAR(10) | `ALTA` \| `MEDIA` \| `BAJA` — default `BAJA` |
| `estado_id` | VARCHAR(10) | `PEN` \| `APR` \| `REC` \| `COM` \| `ANU` — default `PEN` |
| `observaciones` | TEXT | Opcional |
| `fecha_requerida` | DATE | Fecha límite solicitada |
| `usuario_reg` | VARCHAR(100) | |
| `fecha_reg` | TIMESTAMP | |

### `inventario.in_requisicion_detalle`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `requisicion_id` | INTEGER FK → `in_requisicion(id)` | |
| `producto_id` | INTEGER | Producto solicitado |
| `cantidad_solicitada` | DECIMAL(16,2) | Siempre entero en UI (step=1) |
| `cantidad_aprobada` | DECIMAL(16,2) | Nullable, la pone quien aprueba |
| `observaciones` | TEXT | Opcional |

### Secuencia

`aplicacion_id = 'INREQUISICION'` en `general.mg_secuencias` (columna `numero`).
La función `get_next_secuencia` inserta la fila automáticamente si no existe.

---

## Registrar el módulo en BD

```sql
-- 1. Menú
INSERT INTO seguridad.sg_menu (nombre, url, icono, padre_id, orden, estado_id)
VALUES ('Requisiciones', '/inventario/requisicion', 'SwapHoriz', <id_padre_inventario>, <orden>, 'ACT');

-- 2. Permisos por rol (reemplazar <rol_id> y <menu_id>)
INSERT INTO seguridad.sg_permiso (rol_id, menu_id, ver, escribir, eliminar)
VALUES (<rol_id>, <menu_id>, true, true, true);

-- 3. Tablas (ejecutar db-migrations/create_in_requisicion.sql)

-- 4. Secuencia (opcional, la función la auto-crea)
INSERT INTO general.mg_secuencias (empresa_id, aplicacion_id, numero)
VALUES (1, 'INREQUISICION', 0)
ON CONFLICT DO NOTHING;
```

---

## Backend Java

### Paquetes

| Artefacto | Ruta |
|---|---|
| Entidad header | `jpa/inventario/InRequisicion.java` |
| Entidad detalle | `jpa/inventario/InRequisicionDetalle.java` |
| ResumenDTO | `dto/inventario/InRequisicionResumenDTO.java` |
| SearchCriteria | `dto/inventario/InRequisicionSearchCriteria.java` |
| DAO interface | `dao/inventario/InRequisicionDao.java` |
| DAO impl | `dao/inventario/InRequisicionDaoImpl.java` |
| Service interface | `interfaces/inventario/InRequisicionService.java` |
| Service impl | `services/inventario/InRequisicionServiceImpl.java` |
| Controller | `controllers/inventario/InRequisicionController.java` |

### Entidad (`InRequisicion`)
- Extiende `BaseSucursal` (tiene `empresaId`, `sucursalId`, `usuarioReg`, `fechaReg`, `estadoId`)
- `@OneToMany(cascade = CascadeType.ALL, mappedBy = "requisicionId", fetch = FetchType.EAGER)`
- `almacenSolicitanteId` y `almacenOrigenId` son `Integer` simples (no FK JPA)

### Service — puntos clave
- `estadoId` inicial = `"PEN"`, `prioridad` default = `"BAJA"`
- Patrón dos saves para secuencia:
  ```java
  InRequisicion saved = inRequisicionDao.save(entity);
  int seq = secuenciasDao.getNextSecuencia(empresaId,
      InRequisicion.class.getSimpleName().toUpperCase(Locale.ROOT));
  saved.setSecuencia(seq);
  return inRequisicionDao.save(saved);
  ```
- `fixEntityGraph()` establece `detalle.setRequisicionId(requisicion)` en cada detalle

### Controller
- Base URL: `api/v1/inventario/requisiciones`
- `@RequierePermiso(menuUrl = "/inventario/requisicion")` — debe coincidir exactamente con `sg_menu.url`
- `disableById` → pone `estadoId = "ANU"` (anulación lógica, no borrado físico)

### ResumenDTO
```java
Integer id, Integer secuencia, LocalDateTime fechaReg,
String almacenSolicitanteNombre, String almacenOrigenNombre,
String prioridad, String usuarioReg, String estadoId
```
Los nombres de almacén se obtienen con subquery JPQL:
```java
"(SELECT a.nombre FROM InAlmacen a WHERE a.id = r.almacenSolicitanteId)"
```

---

## Frontend React/TypeScript

### Archivos

| Artefacto | Ruta |
|---|---|
| Modelos TS | `src/models/inventario/InRequisicion.tsx` |
| API client | `src/apis/RequisicionController.tsx` |
| Vista | `src/components/inventario/RequisicionView.tsx` |
| Validación Yup | `src/validations/requisicionValidation.ts` |
| Config modal search | `src/types/modalSearchTypes.ts` → `SEARCH_CONFIGS.REQUISICION` |
| Ruta | `src/App.tsx` → `<Route path="inventario/requisicion" element={<RequisicionView />} />` |

### Modelos TS
```typescript
type PrioridadRequisicion = "ALTA" | "MEDIA" | "BAJA"
type EstadoRequisicion = "PEN" | "APR" | "REC" | "COM" | "ANU"
interface InRequisicion { id?, secuencia?, empresaId?, sucursalId?, estadoId?,
  almacenSolicitanteId?, almacenOrigenId?, prioridad, observaciones?, fechaRequerida?, detalles? }
interface InRequisicionDetalle { id?, requisicionId?, productoId?, cantidadSolicitada, cantidadAprobada?, observaciones? }
```

### API client (`RequisicionController.tsx`)
- `BASE_URL = "/api/v1/inventario/requisiciones"`
- Funciones: `buscarRequisiciones`, `getRequisicion`, `getRequisiciones`, `saveRequisicion`, `updateRequisicion`, `disableRequisicion`

### Validaciones Yup
- Requeridos: `almacenSolicitanteId`, `almacenOrigenId`, `prioridad`, `fechaRequerida`, `detalles` (min 1)
- Opcional: `observaciones`
- Cross-field: `almacenOrigenId !== almacenSolicitanteId` (mismo almacén no permitido)

### Modal search config (`SEARCH_CONFIGS.REQUISICION`)
- Endpoint: `POST /api/v1/inventario/requisiciones/buscar`
- Filtros: `fechaInicio`, `fechaFin`, `prioridad` (select), `estadoId` (select)
- Columnas: `secuencia` (No.), `fechaReg`, `almacenSolicitanteNombre`, `almacenOrigenNombre`, `prioridad`, `usuarioReg`, `estadoId`

### Búsqueda de almacén en la vista
- El modal de almacén usa un config dinámico (`almacenConfig`) con el campo `sucursalId` como `select` poblado desde `useSharedSucursalesActivas()`
- El modal se abre con `initialValues = { sucursalId: user?.sucursalId, estadoId: "ACT" }` para pre-filtrar por la sucursal del usuario
- El input muestra `"nombre_almacen (nombre_sucursal)"` como display value

### Estados visibles
| Estado | Color chip |
|---|---|
| PEN | warning |
| APR | success |
| REC | error |
| COM | default |
| ANU | default |

### Layout primera fila (Grid 4+4+4)
1. Búsqueda de requisición existente — `SearchButton variant="input"`
2. Almacén Solicitante — `SearchButton variant="input"`
3. Almacén Origen — `SearchButton variant="input"`

Solo se puede editar cuando `estadoId === "PEN"` o es registro nuevo.
