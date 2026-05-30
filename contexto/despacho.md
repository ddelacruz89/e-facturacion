# Módulo de Despacho — Contexto técnico

## Propósito

Gestiona el ciclo de vida de entregas a clientes desde la factura hasta la confirmación por el conductor. Incluye catálogo de tipos de vehículo, catálogo de vehículos, creación de órdenes de despacho desde facturas, planificación de rutas y vista del conductor para marcar entregas.

Flujo orden: `PEN → EN_RUTA → EN_CAMINO → ENTREGADO | DEVUELTO | ANU`  
Flujo ruta:  `PLANIFICADA ↔ EN_CURSO → COMPLETADA | ANU`

> `EN_CURSO → PLANIFICADA` **solo es válido si ninguna orden de la ruta está en estado `ENTREGADO`**. Si ya hay entregas registradas, el backend lanza `IllegalStateException`.  
> Cuando se marca la última orden activa (no-ANU) como `ENTREGADO`, el backend auto-completa la ruta (`EN_CURSO → COMPLETADA`) automáticamente dentro de la misma transacción.  
> Solo `COMPLETADA` es terminal — no se puede anular.

---

## Flujo principal de asignación

El flujo de negocio va completamente desde **Rutas de Entrega**, sin necesidad de pasar por Órdenes de Despacho:

```
1. Crear Ruta  → fecha + vehículo + conductor (UserSelectorField)
2. Seleccionar facturas elegibles con checkbox (PAG + envio=true + sin orden activa)
3. Botón "Asignar (N)" → POST /{id}/asignar-facturas
   El backend crea las DeOrdenDespacho automáticamente y las asigna a la ruta
4. La lista se refresca — las facturas asignadas desaparecen
```

Una factura es **elegible para despacho** si cumple:
- `facturacion.mf_factura.estado_id = 'PAG'`
- `facturacion.mf_factura.envio = true`
- No existe una `DeOrdenDespacho` activa (≠ ANU) para esa factura en la misma empresa

---

## Base de datos (PostgreSQL, schema `despacho`)

### `despacho.de_tipo_vehiculo`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER | Tenant (sin sucursal — catálogo por empresa) |
| `secuencia` | INTEGER | Nullable — no se usa para catálogos |
| `nombre` | VARCHAR(50) | Ej: CAMION, CAMIONETA, MOTO, AUTO, OTRO |
| `activo` | BOOLEAN | |
| `fecha_reg` | TIMESTAMP | |
| `usuario_reg` | VARCHAR(100) | |

UNIQUE CONSTRAINT: `(empresa_id, nombre)`

### `despacho.de_vehiculo`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER | Tenant (sin sucursal — compartido entre sucursales) |
| `secuencia` | INTEGER | Nullable |
| `tipo_id` | INTEGER FK → `de_tipo_vehiculo(id)` | FK al catálogo de tipos |
| `descripcion` | VARCHAR(200) | |
| `placa` | VARCHAR(20) | Nullable |
| `activo` | BOOLEAN | |

### `despacho.de_ruta_entrega`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `secuencia` | INTEGER | Secuencia por empresa (`DERUTAENTREGA`) |
| `empresa_id` | INTEGER | |
| `sucursal_id` | INTEGER FK → `sg_sucursales(id)` | |
| `fecha` | DATE | Fecha de la ruta |
| `vehiculo_id` | INTEGER FK → `de_vehiculo(id)` | |
| `conductor_username` | VARCHAR(100) | Username del sistema — no FK |
| `estado_id` | VARCHAR(20) | `PLANIFICADA` \| `EN_CURSO` \| `COMPLETADA` \| `ANU` |
| `notas` | TEXT | Nullable |
| `usuario_reg` | VARCHAR(100) | |
| `fecha_reg` | TIMESTAMP | |

### `despacho.de_orden_despacho`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `secuencia` | INTEGER | Secuencia por empresa (`DEORDENDESPACHO`) |
| `empresa_id` | INTEGER | |
| `sucursal_id` | INTEGER FK → `sg_sucursales(id)` | |
| `factura_id` | INTEGER | FK lógica a `facturacion.mf_factura(id)` — no FK física |
| `factura_secuencia` | INTEGER | Número visible de la factura origen |
| `cliente_id` | INTEGER | Denormalizado desde factura |
| `cliente_nombre` | VARCHAR(200) | Denormalizado desde factura (razonSocial) |
| `cliente_telefono` | VARCHAR(30) | Nullable |
| `direccion_entrega` | TEXT | Nullable |
| `fecha_compromiso` | TIMESTAMP | Default: `ruta.fecha` a las 23:59 cuando se crea vía `asignarFacturas` |
| `ruta_id` | INTEGER FK → `de_ruta_entrega(id)` | Se asigna al agregar a ruta |
| `notas` | TEXT | Nullable |
| `fecha_entrega` | TIMESTAMP | Se llena al marcar ENTREGADO |
| `usuario_entrego` | VARCHAR(100) | Username del conductor al marcar ENTREGADO |
| `estado_id` | VARCHAR(20) | Ver flujo arriba |
| `usuario_reg` | VARCHAR(100) | |
| `fecha_reg` | TIMESTAMP | |

UNIQUE CONSTRAINT: `(factura_id, empresa_id)` — previene doble despacho de la misma factura.

### Campo `envio` en `facturacion.mf_factura`

```sql
-- db-migrations/add_envio_to_mf_factura.sql
ALTER TABLE facturacion.mf_factura
    ADD COLUMN IF NOT EXISTS envio BOOLEAN DEFAULT FALSE;
```

El campo `envio = true` indica que la factura requiere entrega física. Se marca desde `FacturacionView` con el checkbox **"Para Envío"**. Solo las facturas con `envio = true` y `estado_id = 'PAG'` aparecen como elegibles para despacho.

### Secuencias requeridas (`general.mg_secuencias`)

```sql
INSERT INTO general.mg_secuencias (empresa_id, aplicacion_id, numero)
VALUES (1, 'DEORDENDESPACHO', 0), (1, 'DERUTAENTREGA', 0)
ON CONFLICT (empresa_id, aplicacion_id) DO NOTHING;
```

---

## Backend Java (`com.braintech.eFacturador`)

### Entidades JPA (`jpa/despacho/`)

| Clase | Tabla | Superclase |
|---|---|---|
| `DeTipoVehiculo` | `de_tipo_vehiculo` | `BaseEntityPk` |
| `DeVehiculo` | `de_vehiculo` | `BaseEntityPk` |
| `DeOrdenDespacho` | `de_orden_despacho` | `BaseSucursal` + `@Id` propio |
| `DeRutaEntrega` | `de_ruta_entrega` | `BaseSucursal` + `@Id` propio |

### Entidad `MfFactura` (`jpa/facturacion/`)

Tiene el campo `@Column(name = "envio") private Boolean envio = false;` agregado para controlar si la factura requiere envío.

### DTOs

**`dto/despacho/`**

| DTO | Uso |
|---|---|
| `DeOrdenDespachoResumenDTO` | Resultado de `POST /buscar` |
| `DeRutaEntregaResumenDTO` | Incluye `totalOrdenes` (COUNT subquery en JPQL) |
| `MisEntregasOrdenDTO` | Órdenes dentro de cada ruta en la vista del conductor |
| `MisEntregasRutaDTO` | Ruta + lista de `MisEntregasOrdenDTO` |
| `MarcarEstadoDTO` | `{ estadoId, notas }` — para cambios de estado |
| `DeOrdenDespachoSearchCriteria` | Filtros + `page`/`size` |
| `DeRutaEntregaSearchCriteria` | Filtros + `page`/`size` |

**`dto/facturacion/MfFacturaParaDespachoDTO`** — DTO slim para listar facturas elegibles para despacho:

```java
@Data @NoArgsConstructor @AllArgsConstructor
public class MfFacturaParaDespachoDTO {
  private Integer id;
  private Integer secuencia;
  private String razonSocial;
  private Integer clienteId;
  private BigDecimal total;
  private LocalDateTime fechaReg;
}
```

### Repositorios (`dao/despacho/`)

- `DeTipoVehiculoRepository` — JpaRepository con `findAllByEmpresaId`, `findAllByEmpresaIdAndActivoTrue`
- `DeVehiculoRepository` — JpaRepository con `findAllActivosByEmpresaId`, `findByIdAndEmpresaId`
- `DeOrdenDespachoDaoImpl` — EntityManager JPQL: `existsByFacturaId`, `searchByCriteria`, `findPendientesByEmpresaAndSucursal`, `findMisOrdenesDirectas`, `findByRutaId`
- `DeRutaEntregaDaoImpl` — EntityManager JPQL: `searchByCriteria`, `findByFechaAndConductor`

### `FacturaDao` (`dao/facturacion/`)

Query JPQL agregado para obtener facturas elegibles:

```java
@Query("""
    SELECT new com.braintech.eFacturador.dto.facturacion.MfFacturaParaDespachoDTO(
        f.id, f.secuencia, f.razonSocial, f.clienteId, f.total, f.fechaReg)
    FROM MfFactura f
    WHERE f.empresaId = :empresaId
      AND f.sucursalId = :sucursalId
      AND f.estadoId = 'PAG'
      AND f.envio = true
      AND NOT EXISTS (
          SELECT o FROM DeOrdenDespacho o
          WHERE o.facturaId = f.id
            AND o.empresaId = :empresaId
            AND o.estadoId <> 'ANU')
    ORDER BY f.fechaReg DESC
    """)
List<MfFacturaParaDespachoDTO> findFacturasParaDespacho(
    @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);
```

### Servicios (`services/despacho/`)

**`DeOrdenDespachoServiceImpl`**
- `save`: verifica `existsByFacturaId` antes de crear; estado inicial `PEN`; llama `secuenciasDao.getNextSecuencia(empresaId, "DEORDENDESPACHO")` en el segundo save.
- `marcarEstado`: valida transiciones (ANU es terminal; ENTREGADO solo permite → DEVUELTO); al marcar ENTREGADO llena `fechaEntrega` + `usuarioEntrego`. **Tras guardar, si la orden pertenece a una ruta, llama `autoCompletarRuta`**: si todas las órdenes no-ANU de la ruta son ENTREGADO, pasa la ruta de `EN_CURSO` a `COMPLETADA` en la misma transacción.
- `getMisEntregas(fecha)`: carga rutas del conductor (por JWT username + fecha) + vehículo + órdenes asignadas.

**`DeRutaEntregaServiceImpl`**
- Inyecta: `DeRutaEntregaDao`, `DeOrdenDespachoDao`, `FacturaDao`, `SgSucursalRepository`, `SecuenciasDao`, `TenantContext`.
- `asignarOrdenes(rutaId, ordenIds)`: asigna `DeOrdenDespacho` ya existentes a la ruta (método legacy, se mantiene).
- `asignarFacturas(rutaId, facturaIds)`: **flujo principal**. Por cada `facturaId`:
  - Si ya existe una `DeOrdenDespacho` activa → la omite (evita duplicado).
  - Si no existe → crea `DeOrdenDespacho` con datos denormalizados de la factura, `fechaCompromiso = ruta.fecha.atTime(23,59)`, `estadoId = EN_RUTA`, genera secuencia.
  - Bloquea si la ruta está `ANU` o `COMPLETADA`.
- `disableById`: devuelve órdenes no entregadas a `PEN`. **Solo bloquea si `COMPLETADA`** — sí permite anular `EN_CURSO`.
- `cambiarEstado`: valida `EN_CURSO → PLANIFICADA` — **lanza excepción si alguna orden de la ruta tiene `estadoId = ENTREGADO`**. Las demás transiciones se aceptan sin restricción adicional.

**`FacturacionServices`**
- `getFacturasParaDespacho()`: lee `empresaId`/`sucursalId` del `TenantContext`, delega a `FacturaDao.findFacturasParaDespacho`.

**`DeTipoVehiculoServiceImpl`** / **`DeVehiculoServiceImpl`** — CRUD estándar; no usan secuencias.

### Endpoints REST

#### `api/v1/facturacion/facturas`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/para-despacho` | Facturas elegibles: PAG + envio=true + sin orden activa |

#### `api/v1/despacho/tipo-vehiculo`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/` | autenticado |
| GET | `/activos` | autenticado |
| GET | `/{id}` | autenticado |
| POST | `/` | `@RequierePermiso(/despacho/vehiculos, ESCRIBIR)` |
| PUT | `/{id}` | `@RequierePermiso(/despacho/vehiculos, ESCRIBIR)` |
| DELETE | `/{id}` | `@RequierePermiso(/despacho/vehiculos, ELIMINAR)` |

#### `api/v1/despacho/vehiculos`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/` | autenticado |
| GET | `/activos` | autenticado |
| GET | `/{id}` | autenticado |
| POST | `/` | `ESCRIBIR` |
| PUT | `/{id}` | `ESCRIBIR` |
| DELETE | `/{id}` | `ELIMINAR` |

#### `api/v1/despacho/ordenes`
| Método | Ruta | Notas |
|---|---|---|
| POST | `/` | Crear orden manualmente desde factura |
| GET | `/{id}` | Objeto completo |
| POST | `/buscar` | Paginado → `ResumenDTO` |
| PATCH | `/{id}/estado` | Body: `MarcarEstadoDTO` |
| GET | `/pendientes` | Sin ruta asignada (estado PEN) |
| GET | `/mis-entregas?fecha=yyyy-MM-dd` | Vista del conductor — filtra por JWT username |

#### `api/v1/despacho/rutas`
| Método | Ruta | Notas |
|---|---|---|
| POST | `/` | Crear ruta |
| GET | `/{id}` | Objeto completo |
| POST | `/buscar` | Paginado → `ResumenDTO` |
| POST | `/{id}/asignar-ordenes` | Body: `{ "ordenIds": [1,2,3] }` — asigna órdenes ya existentes |
| POST | `/{id}/asignar-facturas` | Body: `{ "facturaIds": [1,2,3] }` — **flujo principal**: crea órdenes y asigna |
| PATCH | `/{id}/estado` | Body: `{ "estadoId": "..." }` — incluye EN_CURSO→PLANIFICADA |
| DELETE | `/{id}` | Anula ruta (PLANIFICADA o EN_CURSO) y devuelve órdenes a PEN |

---

## Frontend React/TypeScript (`e-facturador-web/src/`)

### Modelos (`models/despacho/DespachoModels.tsx`)

`DeTipoVehiculo`, `DeVehiculo`, `DeOrdenDespacho`, `DeRutaEntrega`, `DeOrdenDespachoResumen`, `DeRutaEntregaResumen`, `MisEntregasOrdenDTO`, `MisEntregasRutaDTO`, `MarcarEstadoDTO`, `DeOrdenDespachoSearchCriteria`, `DeRutaEntregaSearchCriteria`, **`MfFacturaParaDespacho`**.

### Modelo `Factura` (`models/facturacion.tsx`)

Tiene el campo `envio?: boolean` agregado al interface `Factura`.

### API Controllers (`apis/`)

| Archivo | Funciones clave |
|---|---|
| `DeTipoVehiculoController.tsx` | CRUD tipos de vehículo |
| `DeVehiculoController.tsx` | CRUD vehículos, `getVehiculosActivos` |
| `DeOrdenDespachoController.tsx` | `saveOrdenDespacho`, `buscarOrdenes`, `marcarEstadoOrden`, `getOrdenesPendientes` |
| `DeRutaEntregaController.tsx` | `saveRutaEntrega`, `buscarRutasEntrega`, `asignarOrdenesARuta`, **`asignarFacturasARuta`**, `cambiarEstadoRuta`, `disableRutaEntrega` |
| `FacturaController.tsx` | `getByNumeroFactura`, `getFacturaById`, **`getFacturasParaDespacho`** |

> **IMPORTANTE:** Usar siempre `apiClient` (no `axios` directamente). `apiClient` tiene el interceptor que agrega `Authorization: Bearer <token>`. Sin él, todas las requests devuelven 403.

### Componentes

**`components/shared/UserSelectorField.tsx`** — Componente reutilizable de selección de usuario del sistema:
- Carga usuarios vía `POST /api/v1/seguridad/usuario/buscar` con `{}` al montar.
- Muestra `Autocomplete` con opción `nombre (username)`.
- Props: `value: string` (username), `onChange: (username: string) => void`, `label?`, `disabled?`, `size?`, `fullWidth?`.
- Usar en cualquier campo que requiera seleccionar un usuario del sistema.

**`components/search/SearchButton.tsx`** — Props adicionales disponibles en `variant="button"`:
- `buttonVariant?: "contained" | "outlined" | "text"` — default `"outlined"`. Pasar `"contained"` para botones de ActionBar con color de fondo.
- `sx?: SxProps<Theme>` — estilos MUI adicionales, útil para aplicar colores de paleta.

**`components/despacho/`**

| Componente | Ruta frontend | Descripción |
|---|---|---|
| `DeTipoVehiculoView` | `/despacho/tipo-vehiculo` | CRUD catálogo tipos de vehículo |
| `DeVehiculoView` | `/despacho/vehiculos` | CRUD vehículos — dropdown carga tipos del catálogo |
| `DeOrdenDespachoView` | `/despacho/ordenes` | Buscar/ver órdenes; botón "Facturas para Despacho" abre diálogo de selección manual |
| `DeRutaEntregaView` | `/despacho/rutas` | **Flujo principal**: crear ruta → seleccionar facturas con checkbox → asignar; conductor usa `UserSelectorField` |
| `MisEntregasView` | `/despacho/mis-entregas` | Vista conductor: rutas del día + marcar EN_CAMINO/ENTREGADO/DEVUELTO |

**`components/facturacion/FacturacionView.tsx`**
- Tiene checkbox **"Para Envío"** (`FormControlLabel` + `Checkbox`) controlado por `watch("envio")` / `setValue("envio", ...)`.
- Se carga con `handleSelectFactura`, se limpia en `handleClean`, y se inicializa en `false` en `defaultValues`.
- Deshabilitado cuando la factura ya está guardada (`disabled={save}`).

### `DeRutaEntregaView` — lógica de estado

| Estado ruta | Botones disponibles |
|---|---|
| `PLANIFICADA` | Iniciar Ruta → EN_CURSO \| Guardar \| Anular |
| `EN_CURSO` | Completar Ruta → COMPLETADA \| **Regresar a Planificada** (solo si no hay ENTREGADAS) \| Anular |
| `COMPLETADA` | — (solo lectura) |
| `ANU` | — (solo lectura) |

> "Regresar a Planificada" se oculta en el frontend si `ordenesAsignadas.some(o => o.estadoId === 'ENTREGADO')`. El backend también lo rechaza con error.

Panel **"Órdenes Asignadas a esta Ruta"**: visible siempre que haya una ruta cargada (todos los estados). Muestra tabla con No. Orden, Factura No., Cliente, Compromiso y Estado (chip con color). Se carga al seleccionar la ruta y se refresca tras cada asignación. Usa `buscarOrdenesDespacho({ rutaId, page: 0, size: 100 })` — el resultado ya viene como array (unwrapContent extrae `.content`).

Panel **"Facturas para Despacho"** (asignar nuevas): visible solo para `PLANIFICADA` y `EN_CURSO`. Lista facturas elegibles con checkbox, se refresca al guardar, asignar o anular.

### Colores de botones en `DeRutaEntregaView`

Botones de ActionBar — paleta **complementaria**:
- "Buscar Ruta": `#526671` verde-azul (teal), hover `#3d4e56`
- "Nueva Ruta": `#715D52` naranja-tierra, hover `#55463e`

Botones de estado — paleta **tetrádica**:
- Iniciar Ruta / Completar Ruta: `#527158` verde-salvia, hover `#3c5541`
- Regresar a Planificada: `#716752` dorado-cálido, hover `#554e3d`
- Anular: `#71526B` violeta-rosa, hover `#553f51`
- Asignar (N): `#5F5271` violeta-azul, hover `#483e56`

### Búsquedas modales (`types/modalSearchTypes.ts`)

| Key | Endpoint | Notas |
|---|---|---|
| `SEARCH_CONFIGS.ORDEN_DESPACHO` | `POST /api/v1/despacho/ordenes/buscar` | Columnas: No., Fecha, Factura No., Cliente, Compromiso, Conductor, Estado |
| `SEARCH_CONFIGS.RUTA_ENTREGA` | `POST /api/v1/despacho/rutas/buscar` | Columnas: No., Fecha, Vehículo, Placa, Conductor, Órdenes, Estado |

---

## Integración con otros módulos

### Factura cliente (`facturacion.mf_factura`)
- Campo `envio BOOLEAN DEFAULT FALSE` — se marca desde `FacturacionView` con el checkbox "Para Envío".
- `GET /api/v1/facturacion/facturas/para-despacho` devuelve `MfFacturaParaDespachoDTO[]` con facturas PAG + envio=true + sin orden activa.
- Al crear orden via `asignarFacturas`, se denormalizan: `clienteNombre` (← `razonSocial`), `clienteId`, `facturaId`, `facturaSecuencia`.
- `fechaCompromiso` se inicializa a `ruta.fecha` a las 23:59 — editable posteriormente desde `DeOrdenDespachoView`.

### Conductor
- No es una entidad separada. El conductor es un usuario del sistema.
- `conductorUsername` en `DeRutaEntrega` = username del JWT.
- Se selecciona en `DeRutaEntregaView` con `UserSelectorField` (carga `POST /api/v1/seguridad/usuario/buscar`).
- `getMisEntregas` filtra por `tenantContext.getCurrentUsername()`.

---

## Seguridad (`seguridad.sg_menu` / `seguridad.sg_permiso`)

Módulo `DE` — 5 menús registrados:

| `url` | `menu` | `orden` | `tipo_menu_id` |
|---|---|---|---|
| `/despacho/tipo-vehiculo` | Tipos de Vehículo | 5 | `P` |
| `/despacho/vehiculos` | Vehículos | 1 | `P` |
| `/despacho/ordenes` | Órdenes de Despacho | 2 | `A` |
| `/despacho/rutas` | Rutas de Entrega | 3 | `A` |
| `/despacho/mis-entregas` | Mis Entregas | 4 | `A` |

Scripts de migración:
- `db-migrations/create_despacho_module.sql` — schema + tablas despacho
- `db-migrations/create_tipo_vehiculo.sql` — tabla `de_tipo_vehiculo` + ALTER `de_vehiculo`
- `db-migrations/insert_menu_despacho.sql` — módulo, menús y permisos en seguridad
- `db-migrations/add_envio_to_mf_factura.sql` — campo `envio` en `facturacion.mf_factura`

---

## Notas importantes

- **`apiClient` vs `axios`**: Usar siempre `apiClient` en los API controllers del frontend. Sin el interceptor, todas las requests devuelven 403.
- **`ddl-auto=update`**: Al agregar columnas NOT NULL a tablas con datos, ejecutar la migración SQL antes de reiniciar el backend.
- **Secuencias**: Insertar registros en `general.mg_secuencias` para `DEORDENDESPACHO` y `DERUTAENTREGA` antes de crear órdenes/rutas.
- **`asignarFacturas` es idempotente**: si una factura ya tiene orden activa, se omite silenciosamente — no lanza error ni crea duplicados.
- **`disableById` solo bloquea `COMPLETADA`**: `PLANIFICADA` y `EN_CURSO` se pueden anular; las órdenes no entregadas vuelven a `PEN` y el campo `envio` de la factura queda en `true` para reaparecer en la lista.
- **`cambiarEstado` no valida transiciones**: cualquier cambio de estado es aceptado, incluyendo `EN_CURSO → PLANIFICADA`. La validación de flujo es responsabilidad del frontend.
