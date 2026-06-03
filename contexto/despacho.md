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

### `despacho.de_ruta_zona`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `ruta_id` | INTEGER FK → `de_ruta_entrega(id)` | |
| `cod_provincia` | CHAR(2) FK → `mg_provincia` | |
| `municipio_id` | INTEGER FK → `mg_municipio(id)` | |
| `barrio_id` | INTEGER FK → `mg_barrio_paraje(id)` | **Nullable** — si NULL incluye todos los barrios del municipio |

Filtrado: cuando una ruta tiene zonas, solo aparecen facturas cuyos clientes tengan `municipio_id` en alguna zona con `barrio_id = NULL`, o `barrio_id` en alguna zona específica. Sub-barrios están incluidos implícitamente (el cliente guarda `barrio_id`, no `sub_barrio_id`). Si la ruta no tiene zonas, se muestran todos los clientes.

Migración: `db-migrations/create_ruta_zona.sql`

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
| `DeRutaZona` | `de_ruta_zona` | — (plain entity, sin BaseSucursal) |

`DeRutaZona` campos: `id`, `rutaId` (Integer FK), `codProvincia` (CHAR 2), `municipioId` (Integer FK), `barrioId` (Integer FK, nullable). Si `barrioId = null` incluye todos los barrios del municipio.

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
@Data @NoArgsConstructor
public class MfFacturaParaDespachoDTO {
  private Integer id;
  private Integer secuencia;
  private String razonSocial;
  private Integer clienteId;
  private BigDecimal total;
  private LocalDateTime fechaReg;
  private String direccionEntrega; // enriquecido en FacturacionServices (no viene del JPQL)
  // Constructor 6-args usado por el JPQL
}
```

`direccionEntrega` se construye en `FacturacionServices.buildDireccion()` con todos los niveles geográficos del cliente: `"calle, sub-barrio, barrio, municipio, provincia — referencia"`. Solo se incluyen los niveles que el cliente tenga registrados.

**`dto/despacho/DeRutaZonaResumenDTO`** — zona con nombres resueltos:
```java
// id, rutaId, codProvincia, provinciaNombre, municipioId, municipioNombre, barrioId, barrioNombre
```

### Repositorios (`dao/despacho/`)

- `DeTipoVehiculoRepository` — JpaRepository con `findAllByEmpresaId`, `findAllByEmpresaIdAndActivoTrue`
- `DeVehiculoRepository` — JpaRepository con `findAllActivosByEmpresaId`, `findByIdAndEmpresaId`
- `DeOrdenDespachoDaoImpl` — EntityManager JPQL: `existsByFacturaId`, `searchByCriteria`, `findPendientesByEmpresaAndSucursal`, `findMisOrdenesDirectas`, `findByRutaId`
- `DeRutaEntregaDaoImpl` — EntityManager JPQL: `searchByCriteria`, `findByFechaAndConductor`
- `DeRutaZonaRepository` — JpaRepository: `findByRutaId(Integer)`, `deleteByRutaId(Integer)`
- `DeRutaZonaDaoImpl` — `@Repository` con EntityManager JPQL: `findZonasConNombres(rutaId)` — resuelve nombres de provincia/municipio/barrio con subqueries

### Repositorios de ubicación (`dao/general/`) — nuevos

- `MgMunicipioRepository` — JpaRepository`<MgMunicipio, Integer>` — para `findAllById` batch
- `MgBarrioParajeRepository` — JpaRepository`<MgBarrioParaje, Integer>` — para `findAllById` batch
- `MgSubBarrioRepository` — JpaRepository`<MgSubBarrio, Integer>` — para `findAllById` batch

Estos coexisten con los DAOs custom `MgMunicipioDao`, `MgBarrioParajeDao`, `MgSubBarrioDao` (usados para búsquedas paginadas y cascadas). Los repositories se usan exclusivamente en `FacturacionServices` para carga batch.

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
- Inyecta: `DeRutaEntregaDao`, `DeOrdenDespachoDao`, `FacturaDao`, `ClienteDao`, `SgSucursalRepository`, `SecuenciasDao`, `TenantContext`, `DeRutaZonaRepository`, `DeRutaZonaDaoImpl`, `MgProvinciaDao`, `MgMunicipioRepository`, `MgBarrioParajeRepository`, `MgSubBarrioRepository`.
- Métodos de zonas: `getZonas(rutaId)`, `addZona(rutaId, DeRutaZona)`, `removeZona(rutaId, zonaId)`.
- `asignarOrdenes(rutaId, ordenIds)`: asigna `DeOrdenDespacho` ya existentes a la ruta (método legacy, se mantiene).
- `asignarFacturas(rutaId, facturaIds)`: **flujo principal**. Antes del loop principal carga los catálogos geográficos en batch (provincias, municipios, barrios, sub-barrios de los clientes involucrados) para construir la dirección completa. Por cada `facturaId`:
  - Si ya existe una `DeOrdenDespacho` activa → la omite (evita duplicado).
  - Si no existe → crea `DeOrdenDespacho` con datos denormalizados de la factura, `fechaCompromiso = ruta.fecha.atTime(23,59)`, `estadoId = EN_RUTA`, genera secuencia.
  - Setea `direccionEntrega` con la jerarquía completa: `"calle, sub-barrio, barrio, municipio, provincia — referencia"` (mismo formato que `FacturacionServices.buildDireccion()`).
  - Bloquea si la ruta está `ANU` o `COMPLETADA`.
- `buildDireccionEntrega(cliente, provinciaNombres, municipioNombres, barrioNombres, subBarrioNombres)` — método privado, construye la dirección completa con todos los niveles geográficos disponibles. Usa `calle` si existe, fallback a `direccion` fiscal. Agrega referencia al final separada con ` — `.
- `disableById`: devuelve órdenes no entregadas a `PEN`. **Solo bloquea si `COMPLETADA`** — sí permite anular `EN_CURSO`.
- `cambiarEstado`: valida `EN_CURSO → PLANIFICADA` — **lanza excepción si alguna orden de la ruta tiene `estadoId = ENTREGADO`**. Las demás transiciones se aceptan sin restricción adicional.

**`FacturacionServices`**
- `getFacturasParaDespacho()` → llama `getFacturasParaDespacho(null)`
- `getFacturasParaDespacho(Integer rutaId)`:
  1. Carga facturas elegibles (JPQL, 6-args constructor)
  2. Carga clientes en batch por `clienteId` → `clienteDao.findAllById`
  3. Carga catálogos de ubicación en batch: provincias (32 filas, todas), municipios, barrios, sub-barrios solo de los clientes presentes
  4. Construye `direccionEntrega` con `buildDireccion()`: `"calle, sub-barrio, barrio, municipio, provincia — referencia"`
  5. Si `rutaId != null` y hay zonas en `de_ruta_zona`: filtra facturas por zona usando el mismo `clienteMap` (sin query adicional)
- `buildDireccion(cliente, provinciaNombres, municipioNombres, barrioNombres, subBarrioNombres)` — método privado, construye la dirección completa.

**Inyecciones en `FacturacionServices`**: `FacturaDao`, `TenantContext`, `SecuenciasDao`, `ECFServices`, `DeRutaZonaRepository`, `ClienteDao`, `MgProvinciaDao`, `MgMunicipioRepository`, `MgBarrioParajeRepository`, `MgSubBarrioRepository`.

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
| GET | `/{id}/zonas` | Lista de zonas geográficas con nombres resueltos |
| POST | `/{id}/zonas` | Body: `{ codProvincia, municipioId, barrioId? }` — agrega zona |
| DELETE | `/{id}/zonas/{zonaId}` | Elimina zona específica |

---

## Frontend React/TypeScript (`e-facturador-web/src/`)

### Modelos (`models/despacho/DespachoModels.tsx`)

`DeTipoVehiculo`, `DeVehiculo`, `DeOrdenDespacho`, `DeRutaEntrega`, `DeOrdenDespachoResumen`, `DeRutaEntregaResumen`, `MisEntregasOrdenDTO`, `MisEntregasRutaDTO`, `MarcarEstadoDTO`, `DeOrdenDespachoSearchCriteria`, `DeRutaEntregaSearchCriteria`, **`MfFacturaParaDespacho`**, **`DeRutaZona`**.

`MfFacturaParaDespacho` incluye `direccionEntrega?: string` — muestra calle + jerarquía geográfica completa.

`DeRutaZona`: `{ id?, rutaId?, codProvincia, provinciaNombre?, municipioId, municipioNombre?, barrioId?, barrioNombre? }`

### Modelo `Factura` (`models/facturacion.tsx`)

Tiene el campo `envio?: boolean` agregado al interface `Factura`.

### API Controllers (`apis/`)

| Archivo | Funciones clave |
|---|---|
| `DeTipoVehiculoController.tsx` | CRUD tipos de vehículo |
| `DeVehiculoController.tsx` | CRUD vehículos, `getVehiculosActivos` |
| `DeOrdenDespachoController.tsx` | `saveOrdenDespacho`, `buscarOrdenes`, `marcarEstadoOrden`, `getOrdenesPendientes` |
| `DeRutaEntregaController.tsx` | `saveRutaEntrega`, `buscarRutasEntrega`, `asignarOrdenesARuta`, **`asignarFacturasARuta`**, `cambiarEstadoRuta`, `disableRutaEntrega`, **`getZonasDeRuta`**, **`addZonaARuta`**, **`removeZonaDeRuta`** |
| `FacturaController.tsx` | `getByNumeroFactura`, `getFacturaById`, **`getFacturasParaDespacho(rutaId?)`** — acepta `rutaId` opcional para filtrar por zonas |

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
| `DeRutaEntregaView` | `/despacho/rutas` | **Flujo principal**: crear ruta → seleccionar facturas con checkbox → asignar; tabla de órdenes con columna Recibo (ícono 🧾 abre `ReciboViewer`) |
| `MisEntregasView` | `/despacho/mis-entregas` | Vista conductor responsive (mobile-first): rutas del día + marcar EN_CAMINO/ENTREGADO/DEVUELTO + modal cámara para recibo |
| `ReciboEntregaConfigView` | `/despacho/config/recibo` | Empresa activa el feature y configura storage (AWS S3 / Azure Blob / Local) |
| `ReciboViewer` | compartido | Visor a pantalla completa del recibo; resuelve URL según storage tipo; exporta `resolveReciboUrl()` |

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

Panel **"Zonas Geográficas"**: visible cuando hay ruta cargada. Selector cascada `Provincia → Municipio → Barrio/Paraje` (barrio opcional). Se pueden agregar múltiples municipios y múltiples barrios por municipio. Botón "Agregar" → `POST /{id}/zonas`. Tabla con zonas existentes y botón delete. Si no hay zonas → sin filtro geográfico.

Panel **"Facturas para Despacho"** (asignar nuevas): visible solo para `PLANIFICADA` y `EN_CURSO`. Lista facturas elegibles con checkbox. Muestra `📍 calle, sub-barrio, barrio, municipio, provincia` bajo el nombre del cliente. Si hay zonas activas en la ruta, solo muestra facturas de clientes en esas zonas. Se refresca al guardar, asignar o anular.

### `MisEntregasView` — diseño responsive (mobile-first)

Diseñado para iPhone 14 Pro Max (430px lógico) y superior. Breakpoint de corte: `xs` (0–599px) vs `sm` (600px+).

**Barra de fecha/actualizar:**
- `flexWrap: "wrap"` — el campo fecha y el botón se redistribuyen en pantallas angostas.
- Contador "X/Y entregadas" se alinea a la derecha en xs, izquierda en sm.

**Header de ruta (`#272C36`):**
- Texto de ruta con `overflow: hidden`, `textOverflow: ellipsis`, `whiteSpace: nowrap` — nunca revienta el layout.
- Contador de órdenes: oculto en xs (`display: { xs: "none", sm: "block" }`); reemplazado por una barra compacta (`#3a4050`) debajo del header en mobile.

**Tarjeta de orden:**
- Título (`#secuencia — clienteNombre`) + chip de estado en `flexWrap: "wrap"` — el chip cae a nueva línea si no cabe.
- Captions con emojis para escaneo visual: 📞 teléfono, 📍 dirección, 🕐 compromiso, ✅ entregado, 📝 notas.
- **Botones de acción** (En Camino / Entregado / Devuelto):
  - xs: fila con `flex: "1 1 auto"` debajo del contenido, `minHeight: 44px` (Apple HIG touch target).
  - sm+: misma fila flexible, `minHeight: 32px`.
  - El bloque de botones solo se renderiza si `tieneAcciones` (estado `EN_RUTA` o `EN_CAMINO`).

**Modal de devolución:**
- `width: { xs: "calc(100vw - 32px)", sm: "auto" }` — ocupa casi todo el ancho en mobile.
- `minWidth: { sm: 320 }` en desktop.
- Overlay semitransparente detrás (`rgba(0,0,0,0.4)`) cierra el modal al tocarlo.
- Botones del modal: `minHeight: { xs: 44, sm: 36 }`.

**Padding:**
- Contenedor exterior: `p: { xs: 1, sm: 2 }`.
- Tarjetas: `px: { xs: 1.5, sm: 2 }`.

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

Módulo `DE` — 8 menús registrados:

| `url` | `menu` | `orden` | `tipo_menu_id` | Empresas |
|---|---|---|---|---|
| `/despacho/vehiculos` | Vehículos | 1 | `P` | todas |
| `/despacho/ordenes` | Órdenes de Despacho | 2 | `A` | todas |
| `/despacho/rutas` | Rutas de Entrega | 3 | `A` | todas |
| `/despacho/mis-entregas` | Mis Entregas | 4 | `A` | todas |
| `/despacho/tipo-vehiculo` | Tipos de Vehículo | 5 | `P` | todas |
| `/despacho/config/recibo` | Config. Recibo | 6 | `P` | todas |
| `/admin/feature-plan` | Admin Features | 7 | `P` | solo empresa_id = 1 |
| `/despacho/precios-envio` | Precios de Envío | 8 | `P` | todas |

Scripts de migración:
- `db-migrations/create_despacho_module.sql` — schema + tablas despacho
- `db-migrations/create_tipo_vehiculo.sql` — tabla `de_tipo_vehiculo` + ALTER `de_vehiculo`
- `db-migrations/insert_menu_despacho.sql` — módulo, menús y permisos en seguridad
- `db-migrations/add_envio_to_mf_factura.sql` — campo `envio` en `facturacion.mf_factura`
- `db-migrations/create_feature_plan.sql` — tablas `sg_feature_plan` y `sg_empresa_feature_config` en schema `seguridad`
- `db-migrations/add_recibo_url_to_orden.sql` — campo `recibo_url` en `despacho.de_orden_despacho`
- `db-migrations/create_precio_envio.sql` — tabla `despacho.de_precio_envio` con índices únicos parciales
- `db-migrations/insert_menu_precio_envio.sql` — menú y permisos Precios de Envío

---

## Precios de Envío por Zona — módulo multi-tenant

Cada empresa configura sus propios precios de entrega por barrio y sub-barrio. Las tablas geográficas (`mg_barrio_paraje`, `mg_sub_barrio`) son catálogos globales sin precio; los precios viven en `despacho.de_precio_envio`.

### BD — `despacho.de_precio_envio`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER | Tenant |
| `barrio_id` | INTEGER FK → `mg_barrio_paraje` | NOT NULL — barrio al que aplica |
| `sub_barrio_id` | INTEGER FK → `mg_sub_barrio` | **Nullable** — si NULL el precio aplica a todo el barrio |
| `precio` | DECIMAL(10,2) | |
| `fecha_reg` | TIMESTAMP | |
| `usuario_reg` | VARCHAR(100) | |

Restricciones de unicidad con índices parciales:
- `(empresa_id, barrio_id) WHERE sub_barrio_id IS NULL` — un precio base por barrio
- `(empresa_id, sub_barrio_id) WHERE sub_barrio_id IS NOT NULL` — un precio por sub-barrio

**Regla de prioridad:** sub-barrio con precio propio → usa ese. Sub-barrio sin precio → hereda el del barrio padre. Barrio sin precio → sin precio de envío configurado.

### Backend

| Clase | Paquete |
|---|---|
| `DePrecioEnvio` | `jpa/despacho/` |
| `DePrecioEnvioDTO` | `dto/despacho/` — id, barrioId, barrioNombre, subBarrioId, subBarrioNombre, precio |
| `DePrecioRequestDTO` | `dto/despacho/` — `{ precio }` para PUT |
| `DePrecioEnvioRepository` | `dao/despacho/` — JpaRepository con `@Query` JPQL que resuelve nombres con subqueries |
| `DePrecioEnvioService` / `DePrecioEnvioServiceImpl` | `interfaces+services/despacho/` |
| `DePrecioEnvioController` | `controllers/despacho/` — `api/v1/despacho/precios-envio` |

Endpoints:
- `GET /por-municipio/{municipioId}` — precios configurados del tenant para los barrios de un municipio
- `GET /por-barrio/{barrioId}` — precio del barrio + sub-barrios (para DireccionSelector)
- `GET /efectivo?barrioId=X&subBarrioId=Y` — **precio efectivo en una sola llamada**: sub-barrio si tiene precio propio → barrio como fallback → `0` si ninguno. `subBarrioId` es opcional.
- `PUT /barrio/{barrioId}` → body `{ precio }` — upsert precio base del barrio
- `PUT /sub-barrio/{subBarrioId}` → body `{ precio }` — upsert precio específico del sub-barrio
- `DELETE /barrio/{barrioId}` — elimina precio del barrio
- `DELETE /sub-barrio/{subBarrioId}` — elimina precio del sub-barrio

El service lee `empresaId` de `TenantContext`. El upsert usa `findByEmpresaIdAndBarrioIdAndSubBarrioIdIsNull` / `findByEmpresaIdAndSubBarrioId` para crear o actualizar según exista.

### Frontend

- `src/apis/DePrecioEnvioController.tsx` — funciones API
- `src/components/despacho/DePrecioEnvioView.tsx` — selector Provincia → Municipio → tabla de barrios con precio inline; filas expandibles para sub-barrios
- `PrecioInput` es un componente con estado local: tipear NO propaga al padre → sin lag con muchos barrios
- Los precios del municipio se cargan una sola vez en `preciosTodos` y se reutilizan al expandir sub-barrios (sin segunda llamada al API)
- Sub-barrio muestra "Hereda RD$X" si el barrio padre tiene precio pero el sub-barrio no

---

## Notas importantes

- **`apiClient` vs `axios`**: Usar siempre `apiClient` en los API controllers del frontend. Sin el interceptor, todas las requests devuelven 403.
- **`ddl-auto=update`**: Al agregar columnas NOT NULL a tablas con datos, ejecutar la migración SQL antes de reiniciar el backend.
- **Secuencias**: Insertar registros en `general.mg_secuencias` para `DEORDENDESPACHO` y `DERUTAENTREGA` antes de crear órdenes/rutas.
- **`asignarFacturas` es idempotente**: si una factura ya tiene orden activa, se omite silenciosamente — no lanza error ni crea duplicados.
- **`disableById` solo bloquea `COMPLETADA`**: `PLANIFICADA` y `EN_CURSO` se pueden anular; las órdenes no entregadas vuelven a `PEN` y el campo `envio` de la factura queda en `true` para reaparecer en la lista.
- **`cambiarEstado` no valida transiciones**: cualquier cambio de estado es aceptado, incluyendo `EN_CURSO → PLANIFICADA`. La validación de flujo es responsabilidad del frontend.

---

## Recibo de Entrega — Feature premium configurable

### Modelo de habilitación (dos niveles)

1. **Admin SaaS** (`empresa_id = 1`) habilita el feature por empresa:
   - `POST /api/v1/admin/feature-plan` → `{ empresaId, featureId: "RECIBO_ENTREGA", habilitado: true }`
   - Tabla: `seguridad.sg_feature_plan`

2. **Empresa** configura y activa el feature:
   - `PUT /api/v1/empresa/feature-config/RECIBO_ENTREGA` → `{ activo, storageTipo, storageConfig }`
   - `GET /api/v1/empresa/feature-config/RECIBO_ENTREGA` → retorna config con credenciales enmascaradas (`***`)
   - Tabla: `seguridad.sg_empresa_feature_config`
   - Frontend: `/despacho/config/recibo` → `ReciboEntregaConfigView`

### Proveedores de storage (`storageTipo`)

| Tipo | storageConfig JSON |
|---|---|
| `AWS_S3` | `{ bucketName, region, accessKeyId, secretAccessKey, pathPrefix? }` |
| `AZURE_BLOB` | `{ connectionString, containerName }` |
| `LOCAL` | `{}` — usa `app.storage.local.base-path` del servidor |

Campos sensibles enmascarados en GET: `secretAccessKey`, `connectionString`.

### Campo `recibo_url` en `de_orden_despacho`

- `POST /api/v1/despacho/ordenes/{id}/recibo` (multipart) — sube imagen → guarda URL → retorna `{ reciboUrl }`
- `GET /api/v1/despacho/ordenes/{id}/recibo/file` — sirve el archivo cuando `storageTipo = LOCAL`
- URLs: S3 y Azure retornan URL pública. LOCAL retorna `local://{empresaId}/{filename}` (sirve el backend)

### Flujo en `MisEntregasView`

- `MisEntregasOrdenDTO.requiereRecibo = true` cuando el feature está activo (seteado en `getMisEntregas`)
- Si `requiereRecibo && !reciboUrl` al pulsar "Entregado" → abre `ReciboModal` (cámara/galería)
- El conductor toma la foto → upload → marcar ENTREGADO (flujo encadenado)
- Si ya tiene `reciboUrl` → muestra "Recibo adjunto" en la tarjeta
- `CameraAltIcon` + texto "Foto + Entregar" indica visualmente que se necesita recibo

### Tamaño máximo upload

- `spring.servlet.multipart.max-file-size=10MB`
- `spring.servlet.multipart.max-request-size=11MB`

### Dependencias nuevas en `build.gradle`

- `software.amazon.awssdk:s3:2.26.12`
- `com.azure:azure-storage-blob:12.27.0`

### Superadmin

- Los endpoints `/api/v1/admin/feature-plan/**` validan que `empresaId == 1` (operador SaaS).
- Sin este check, cualquier empresa podría auto-habilitarse features sin pagar.
