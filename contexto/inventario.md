# Módulo de Inventario

## Visión general

El módulo de inventario gestiona el stock de productos en múltiples almacenes por empresa y sucursal. Abarca el ciclo completo: compra (orden de compra → orden de entrada), ajustes, transferencias entre almacenes, requisiciones, lotes, alertas de stock y reportes.

**Schema de BD:** `inventario`  
**Prefijo de entidades Java:** `In`  
**Ruta base de endpoints:** `/api/v1/inventario/`  
**Carpeta backend:** `jpa/inventario/`, `dao/inventario/`, `services/inventario/`, `controllers/inventario/`  
**Carpeta frontend:** `src/models/inventario/`, `src/apis/` (un archivo por módulo)

> Para el trigger `trg_actualiza_inventario`, la función `fn_actualiza_inventario_producto` y el sistema de alertas por límite mínimo, ver `contexto/movimiento.md`.

---

## Sub-módulos

| Sub-módulo | Entidad principal | Tabla | Ruta endpoint |
|---|---|---|---|
| Almacenes | `InAlmacen` | `in_almacenes` | `/almacenes` |
| Suplidores | `InSuplidor` | `in_suplidor` | `/suplidores` |
| Lotes | `InLote` | `in_lote` | `/lotes` |
| Órdenes de compra | `InOrdenesCompras` | `in_ordenes_compras` | `/ordenes-compras` |
| Órdenes de entrada | `InOrdenEntrada` | `in_orden_entrada` | `/orden-entrada` |
| Ajustes de inventario | `InAjusteInventario` | `in_ajuste_inventario` | `/ajustes` |
| Transferencias | `InTransferencia` | `in_transferencias` | `/transferencias` |
| Requisiciones | `InRequisicion` | `in_requisicion` | `/requisiciones` |
| Movimientos | `InMovimiento` | `in_movimientos` | `/movimientos` |
| Stock árbol (paginado) | — | `in_inventarios` | `/stock-arbol` |
| Alertas | `InAlertaInventario` | `in_alerta_inventario` | `/alertas` |
| Dashboard | — | — | `/dashboard` |
| Reportes | — | — | `/reportes` |

---

## Entidades JPA

### InAlmacen
**Tabla:** `inventario.in_almacenes` — extiende `BaseSucursal`

| Campo | Tipo Java | Columna BD | Notas |
|---|---|---|---|
| id | Integer | id | PK Identity |
| nombre | String | nombre | Requerido |
| ubicacion | String | ubicacion | |
| empresaId | Integer | empresa_id | de BaseSucursal |
| sucursalId | SgSucursal | sucursal_id | FK, de BaseSucursal |
| estadoId | String | estado_id | ACT / INA |
| usuarioReg | String | usuario_reg | |
| fechaReg | LocalDateTime | fecha_reg | |

---

### InSuplidor
**Tabla:** `inventario.in_suplidor` — extiende `BaseEntity` (solo `empresaId`, sin `sucursalId`)

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| nombre | String | Requerido |
| razonSocial | String | |
| rnc | String | Solo dígitos, sin formato |
| tipoIdentificacion | String | `C` = Cédula, `R` = RNC |
| direccion | String | |
| contacto1, contacto2 | String | |
| telefono1, telefono2 | String | |
| correo1, correo2 | String | Validación email |
| servicio | Boolean | Si provee servicios |
| producto | Boolean | Si provee productos |
| estadoId | String | ACT / INA |
| tipoComprobante | MgTipoComprobante | FK, tipo de NCF para este suplidor |
| empresaId | Integer | Tenant |

**Sub-recurso:** productos del suplidor (`mg_producto_unidad_suplidor`)
- `GET /{id}/productos` — productos registrados para el suplidor
- `POST /{id}/productos` — agregar producto con precio
- `PUT /{id}/productos/{pid}` — actualizar precio
- `DELETE /{id}/productos/{pid}` — eliminar

---

### InLote
**Tabla:** `inventario.in_lote`  
**Clave primaria compuesta:** `(lote VARCHAR, productoId FK, empresaId Integer)`

| Campo | Tipo Java | Notas |
|---|---|---|
| lote | String | Parte del PK |
| productoId | MgProducto | FK, parte del PK |
| empresaId | Integer | Parte del PK |
| sucursalId | SgSucursal | FK |
| serie | Boolean | Si es número de serie (vínculo 1:1 con unidad) |
| fechaVencimiento | Date | |
| fechaAlertaVencimiento | LocalDate | Fecha a partir de la cual se emite alerta |
| alertasDias | Integer | Días antes del vencimiento para alertar |
| estadoId | String | ACT / CER |
| usuarioReg | String | |
| fechaReg | LocalDateTime | |

**Nota:** Al actualizar lote usar `InLoteUpdateDTO` (solo campos editables: serie, fechas, alertasDias, estadoId). El DAO usa clave compuesta; la firma del método es `findById(String lote, Long productoId)`.

---

### InOrdenesCompras
**Tabla:** `inventario.in_ordenes_compras` — extiende `BaseSucursal`

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| suplidorId | InSuplidor | FK |
| subTotal | BigDecimal | |
| itbis | BigDecimal | |
| total | BigDecimal | |
| descuento | BigDecimal | |
| estadoId | String | PEN / APR / ANU / CON (convertida) |
| cotizacionId | Integer | FK opcional a InCotizacion |
| detalles | List\<InOrdenesComprasDetalles\> | 1:N, cascade ALL, EAGER |
| usuarioReg | String | |
| fechaReg | LocalDateTime | |

**InOrdenesComprasDetalles:**

| Campo | Notas |
|---|---|
| productoId | MgProducto FK |
| cantidad | int |
| precioUnitario | BigDecimal — requerido |
| subTotal | BigDecimal — requerido |
| itbisProducto | BigDecimal |
| itbis | BigDecimal |
| total | BigDecimal |
| unidadNombre | String |
| unidadCantidad | Integer |
| descuentoPorciento | Double |
| descuentoCantidad | Double |
| estadoId | String |

**Flujo especial:** `POST /{id}/convertir-orden-entrada` — crea `InOrdenEntrada` a partir de la orden de compra aprobada, ingresando los movimientos correspondientes.

---

### InOrdenEntrada
**Tabla:** `inventario.in_orden_entrada` — extiende `BaseSucursal`

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| almacenId | Integer | Almacén destino |
| ordenCompraId | Integer | FK opcional a InOrdenesCompras |
| monto | BigDecimal | Subtotal |
| itbis | BigDecimal | |
| total | BigDecimal | |
| descuento | BigDecimal | |
| descuentoPorciento | BigDecimal | |
| inOrdenDetalleList | List\<InOrdenEntradaDetalle\> | 1:N, cascade ALL, EAGER |

**InOrdenEntradaDetalle:**

| Campo | Notas |
|---|---|
| productoId | MgProducto FK |
| cantidad | Integer — cantidad en unidad de entrada |
| lote | String — lote asignado (puede ser NULL) |
| precioUnitario | BigDecimal |
| subTotal, itbis, total | BigDecimal |
| descuentoPorciento | Double |
| unidadNombre | String — nombre de la unidad de compra |
| unidadCantidad | Integer — factor de conversión a unidad base |
| cantidadFraccionaria | Integer — cantidad en unidad base resultante |
| itbisAlSubTotal | Boolean |
| servicio | Boolean |
| suplidorId | InSuplidor FK |
| inOrdenDetalleLotes | List\<InOrdenEntradaDetalleLote\> 1:N, cascade |

**InOrdenEntradaDetalleLote:**

| Campo | Notas |
|---|---|
| cantidad | Integer |
| inLotes | InLote FK compuesta (producto_id + lote_id) |
| ordenEntradaDetalle | InOrdenEntradaDetalle FK |

**Efecto en stock:** Al guardar una orden de entrada, el service inserta un `InMovimiento` con tipo `cr=true` por cada línea → el trigger actualiza `in_inventarios`.

---

### InAjusteInventario
**Tabla:** `inventario.in_ajuste_inventario` — extiende `BaseSucursal`

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| almacenId | Integer | Almacén a ajustar |
| movimientoTipoId | Integer | FK a InMovimientoTipo |
| observacion | String | max 500 |
| estadoId | String | APL / ANU |
| detalles | List\<InAjusteInventarioDetalle\> | 1:N, cascade ALL, EAGER |

**InAjusteInventarioDetalle:**

| Campo | Notas |
|---|---|
| productoId | Integer |
| lote | String — opcional, max 45 |
| cantidadActual | Integer — stock al momento del ajuste |
| cantidadNueva | Integer — stock objetivo |
| diferencia | Integer — cantidadNueva − cantidadActual (firmado) |

**Flujo de aplicación (`POST /ajustes/aplicar`):**
1. Service lee stock actual de cada producto+lote en el almacén.
2. Crea el encabezado y los detalles (estadoId = APL).
3. Por cada detalle: calcula `diferencia = cantidadNueva - cantidadActual`.
4. Inserta `InMovimiento` con `cantidad = |diferencia|` y tipo según cr.
5. El trigger normaliza el signo y actualiza `in_inventarios`.
6. Publica `InStockBajoEvent` async.

**Endpoint de stock actual:** `GET /ajustes/stock?productoId=X&almacenId=Y&lote=Z` → `InStockActualDTO`.  
**Endpoint de lotes con stock:** `GET /ajustes/lotes?productoId=X&almacenId=Y` → `List<String>`.

---

### InTransferencia
**Tabla:** `inventario.in_transferencias` — extiende `BaseSucursal`

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| origenAlmacenId | InAlmacen | FK |
| destinoAlmacenId | InAlmacen | FK |
| requisicionId | Integer | FK opcional |
| estadoId | String | |
| detalles | List\<InTransferenciaDetalle\> | 1:N, cascade ALL, EAGER |

**InTransferenciaDetalle:**

| Campo | Notas |
|---|---|
| productoId | MgProducto FK |
| cant | Integer — cantidad realmente transferida |
| cantSolicitada | Integer — cantidad solicitada (de la requisición) |
| lote | String — lote del producto transferido |
| numeroReferencia | Integer |
| cantidadUnidad | Integer |
| unidadDescripcion | String — max 50 |

**Efecto en stock:** El service inserta dos movimientos por línea:
1. SALIDA en almacén origen (tipo cr=false → cantidad negativa).
2. ENTRADA en almacén destino (tipo cr=true → cantidad positiva).

**Consulta de stock previo a transferencia:**  
`GET /transferencias/stock?productoId=X&almacenId=Y` → cantidad disponible.  
`GET /transferencias/lotes?productoId=X&almacenId=Y` → `InProductoLotesStockDTO`.

---

### InRequisicion
**Tabla:** `inventario.in_requisicion` — extiende `BaseSucursal`

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| secuencia | Integer | Número por empresa (ver patrón de secuencia en CLAUDE.md) |
| almacenSolicitanteId | Integer | Almacén que solicita |
| almacenOrigenId | Integer | Almacén que suministrará |
| prioridad | String | ALTA / MEDIA / BAJA |
| observaciones | String | |
| fechaRequerida | LocalDate | |
| estadoId | String | PEN / APR / ANU / ATN |
| detalles | List\<InRequisicionDetalle\> | 1:N, cascade ALL, EAGER |

**InRequisicionDetalle:**

| Campo | Notas |
|---|---|
| productoId | Integer |
| cantidadSolicitada | BigDecimal |
| cantidadAprobada | BigDecimal — rellena el aprobador |
| observaciones | String |

**Flujo de aprobación:** `POST /{id}/aprobar` → invoca `enviarAprobacion(id)` en el service, que cambia el estado y encola la aprobación. Ver `contexto/aprobaciones.md`.

---

### InMovimiento
**Tabla:** `inventario.in_movimientos` — extiende `BaseSucursal`

| Campo | Tipo Java | Notas |
|---|---|---|
| id | Integer | PK Identity |
| tipoMovimientoId | Integer | FK a InMovimientoTipo |
| numeroReferencia | Integer | ID del documento origen |
| almacenId | Integer | |
| productoId | Integer | |
| lote | String | max 45, puede ser NULL |
| cantidad | Integer | El trigger normaliza el signo según cr |
| cantidadInventario | Integer | Stock resultante — rellena el trigger |
| precioUnitario | BigDecimal | (16,4) |
| costoTotal | BigDecimal | (16,4) |
| observacion | String | max 255 |

**Regla:** Solo se inserta, nunca se actualiza. `cantidadInventario` es computado por el trigger.  
Los campos requeridos por el trigger: `almacen_id`, `producto_id`, `cantidad`, `lote`, `empresa_id`, `sucursal_id`, `tipo_movimiento_id`.

**Índices:** `idx_mov_empresa_sucursal`, `idx_mov_almacen_producto_fecha`, `idx_mov_fecha_reg`, `idx_mov_lote`, `idx_mov_numero_referencia`.

---

### InMovimientoTipo
**Tabla:** `inventario.in_movimientos_tipos` — **catálogo global** (NO filtrar por tenant)

| Campo | Notas |
|---|---|
| id | Integer PK |
| tipoMovimiento | String — nombre descriptivo |
| cr | Boolean — true=crédito/entrada, false=débito/salida |
| modulo | String — módulo origen |
| modificable | Boolean |

Tipos predefinidos habituales: Entrada Compra (cr=true), Salida Venta (cr=false), Ajuste Positivo (cr=true), Ajuste Negativo (cr=false), Entrada Transferencia (cr=true), Salida Transferencia (cr=false), Devolución Compra (cr=true).

---

### InInventario (tabla de stock)
**Tabla:** `inventario.in_inventarios` — extiende `BaseSucursal`

| Campo | Tipo | Notas |
|---|---|---|
| id | Integer | PK Identity |
| productoId | Integer | |
| almacenId | Integer | |
| lote | String | NULL = sin lote |
| cantidad | Integer | Stock actual en este lote+almacén |
| estadoProductoInventario | String | BAJO / SALUDABLE / NULL |

**No se toca directamente desde Java.** Solo la función `fn_actualiza_inventario_producto` (invocada por el trigger) escribe en esta tabla.  
`estadoProductoInventario` es escrito por `InAlertaInventarioListener` (ver `contexto/movimiento.md`).

---

### InAlertaInventario
**Tabla:** `inventario.in_alerta_inventario` — extiende `BaseSucursal`

| Campo | Notas |
|---|---|
| id | Integer PK |
| tipo | STOCK_BAJO / VENCIMIENTO |
| productoId | Integer |
| almacenId | Integer — opcional |
| lote | String — opcional (para VENCIMIENTO) |
| cantidadActual | Integer — stock al momento de la alerta (STOCK_BAJO) |
| limite | Integer — límite configurado (STOCK_BAJO) |
| fechaVencimiento | LocalDate — (VENCIMIENTO) |
| estadoId | ACT / CER |
| fechaCierre | LocalDateTime |
| usuarioCierre | String |

**InAlertaVisto:** `(alerta_id, username)` unique — tracking de alertas ya vistas por usuario.

**Índices:** `idx_alerta_empresa_tipo_estado(empresa_id, tipo, estado_id)`, `idx_alerta_producto_almacen(producto_id, almacen_id, empresa_id, sucursal_id)`.

---

### InCotizacion
**Tabla:** `inventario.in_cotizacion` — extiende `BaseSucursal`  
Cotizaciones de precio a suplidores antes de emitir la orden de compra.

| Campo | Notas |
|---|---|
| id | Integer PK |
| descripcion | String |
| prioridad | String |
| detalles | List\<InCotizacionDetalle\> 1:N cascade |

---

## DTOs clave

### Resúmenes para búsqueda (modal de listado)

| Módulo | DTO Resumen | Campos principales |
|---|---|---|
| Almacenes | `InAlmacenResumenDTO` | id, nombre, ubicacion, estadoId |
| Suplidores | `InSuplidorResumenDTO` | id, nombre, rnc, contacto, estadoId |
| Lotes | `InLoteResumenDTO` | lote, productoId, productoNombre, fechaVencimiento, estadoId, usuarioReg, fechaReg |
| Ord. Compras | `InOrdenesComprasResumenDTO` | id, fechaReg, suplidorNombre, total, estadoId, usuarioReg |
| Ord. Entrada | `InOrdenEntradaResumenDTO` | id, fechaReg, almacenNombre, total, estadoId, usuarioReg |
| Ajustes | `InAjusteInventarioResumenDTO` | id, fechaReg, almacenId, estadoId, movimientoTipoNombre, observacion, usuarioReg, totalLineas |
| Transferencias | `InTransferenciaResumenDTO` | id, fechaReg, origenNombre, destinoNombre, estadoId, usuarioReg |
| Requisiciones | `InRequisicionResumenDTO` | id, secuencia, almacenSolicitante, almacenOrigen, prioridad, fechaRequerida, estadoId |
| Movimientos | `InMovimientoResumenDTO` | id, fechaReg, tipoMovimientoNombre, almacenNombre, productoNombre, lote, cantidad, cantidadInventario, costoTotal |

### Stock

| DTO | Uso |
|---|---|
| `InStockActualDTO` | `{ productoId, productoNombre, almacenId, lote, cantidad }` — stock puntual |
| `InStockCriticoDTO` | `{ productoId, productoNombre, almacenId, almacenNombre, cantidadActual, limite, faltante }` |
| `InProductoLotesStockDTO` | Stock de un producto desglosado por lotes y almacén |
| `InLoteStockResponseDTO` | Stock de un lote específico en todos los almacenes |

### DTOs de Request

| DTO | Uso |
|---|---|
| `InAjusteInventarioRequestDTO` | `{ almacenId, movimientoTipoId, observacion, detalles[] }` |
| `InTransferenciaRequestDTO` | `{ origenAlmacenId, destinoAlmacenId, estadoId, requisicionId, detalles[] }` |
| `InOrdenesComprasRequestDTO` | Crear/actualizar orden de compra |
| `InLoteUpdateDTO` | Campos editables de lote |
| `InSuplidorSimpleDTO` | `{ id, nombre, rnc }` — para dropdowns |

---

## Stock árbol (vista jerárquica)

Endpoint de 3 niveles para navegar stock de manera drill-down:

```
POST /stock-arbol/buscar                                → Página de productos con stock (nivel 1, paginado)
POST /stock-arbol/producto/{id}/almacenes               → Almacenes donde ese producto tiene stock (nivel 2)
POST /stock-arbol/producto/{id}/almacen/{aid}/lotes     → Lotes en ese almacén (nivel 3)
GET  /stock-arbol/stock-critico                         → Productos bajo límite mínimo
```

**Nivel 1 — paginado server-side.** El endpoint `POST /buscar` retorna `Page<InStockProductoNodoDTO>`. El frontend calcula el `size` según la altura de pantalla disponible (ver `calcPageSize()` en `StockArbolView.tsx`) y lo envía en el body. Al navegar páginas o hacer nueva búsqueda, solo se traen los registros de esa página.

**DTOs del árbol:**
- `InStockProductoNodoDTO`: `{ productoId, productoNombre, totalCantidad, estadoStock }`. `estadoStock = MIN(estado)` de todos los almacenes → si cualquier almacén está BAJO, el producto muestra BAJO.
- `InStockAlmacenNodoDTO`: `{ almacenId, almacenNombre, totalCantidad, estadoStock }`. `estadoStock = MAX(estado)` — todos los lotes del mismo producto-almacén tienen el mismo valor.
- `InStockLoteNodoDTO`: `{ lote, cantidad }`.

**Criterios:** `InStockArbolSearchCriteria { sucursalId, almacenId, productoNombre, soloConStock, page, size }`.
- `page` y `size` solo aplican al nivel 1 (`POST /buscar`). Los niveles 2 y 3 no están paginados (un producto tiene pocos almacenes; un almacén tiene pocos lotes).
- El frontend mantiene `activeFilters` (sin page/size) para pasarle a los sub-componentes de nivel 2 y 3.

**Implementación backend — count query:**
El DAO construye el `WHERE` una sola vez y lo reutiliza en dos queries:
1. `SELECT COUNT(DISTINCT p.id) FROM InInventario i JOIN i.productoId p WHERE ...` → total de páginas.
2. La query original con `setFirstResult(page * size)` y `setMaxResults(size)` → datos de la página.
Retorna `PageImpl<>(content, PageRequest.of(page, size), total)`.

**Implementación frontend — `calcPageSize()`:**
```typescript
function calcPageSize(): number {
    // Resta overhead fijo: ActionBar(60) + filtros(100) + cabecera tabla(48)
    //                    + paginador(52) + padding(32) = 292px
    const overhead = 292;
    const rowPx = 41; // altura de fila MUI size="small"
    return Math.max(5, Math.min(50, Math.floor((window.innerHeight - overhead) / rowPx)));
}
```
Se calcula una sola vez al montar (`useState<number>(calcPageSize)`). Ejemplos: 768px → ~11 filas, 1080px → ~19 filas, 1440px → ~28 filas.

**`StockArbolView.tsx` — estados de paginación:**
```typescript
const [page, setPage] = useState(0);               // página actual (0-based)
const [totalElements, setTotalElements] = useState(0);
const [pageSize] = useState<number>(calcPageSize); // fijo por sesión
const [activeFilters, setActiveFilters] = useState<InStockArbolSearchCriteria>(...);
```
- `doSearch(targetPage)` es la función central; el botón Buscar llama `doSearch(0)`.
- `handlePageChange` llama `doSearch(newPage)`.
- `TablePagination` con `rowsPerPageOptions={[pageSize]}` (selector deshabilitado — el size lo decide la pantalla).

**Stock crítico:** Native SQL, join `mg_producto_almacen_limite → mg_producto_unidad_suplidor → mg_producto + in_almacen LEFT JOIN in_inventarios`, filtra `HAVING SUM(cantidad) < MAX(limite)`. Severidad en frontend: Crítico si faltante ≥ 50% del límite, Bajo si menor.

---

## Dashboard de inventario

**Endpoint base:** `/api/v1/inventario/dashboard`

| Endpoint | DTO | Descripción |
|---|---|---|
| `GET /kpis?sucursalId=X` | `DashboardKpiDTO` | KPIs principales (total productos, valor, movimientos hoy…) |
| `GET /sucursales` | `DashboardSucursalDTO` | Sucursales disponibles para el filtro |
| `GET /ajustes-por-tipo?sucursalId=X` | `DashboardAjusteBarDTO` | Ajustes de los últimos 7 días agrupados por tipo |

`sucursalId` puede ser null → datos globales de la empresa.

---

## API controllers TypeScript (frontend)

Cada módulo tiene su archivo en `src/apis/`:

```typescript
// Patrón estándar de cada controller
const BASE_URL = "/api/v1/inventario/{nombre-kebab}";

buscarNombre(criteria): Promise<Page<ResumenDTO>>   // POST /buscar
getNombre(id): Promise<Entidad>                     // GET /{id}
saveNombre(dto): Promise<Entidad>                   // POST /
updateNombre(id, dto): Promise<Entidad>             // PUT /{id}
disableNombre(id): Promise<void>                    // DELETE /{id}
```

Siempre usar `unwrapContent<T>()` para desempaquetar la respuesta.

---

## Configuraciones de búsqueda modal (SEARCH_CONFIGS)

Las keys definidas en `src/types/modalSearchTypes.ts` para inventario:

- `IN_ALMACEN` — buscar almacenes
- `IN_SUPLIDOR` — buscar suplidores
- `IN_LOTE` — buscar lotes
- `IN_ORDEN_COMPRA` — buscar órdenes de compra
- `IN_ORDEN_ENTRADA` — buscar órdenes de entrada
- `IN_AJUSTE_INVENTARIO` — buscar ajustes
- `IN_TRANSFERENCIA` — buscar transferencias
- `IN_REQUISICION` — buscar requisiciones
- `IN_MOVIMIENTO` — buscar movimientos

---

## Relaciones inter-módulo

```
InCotizacion ──────────────► InOrdenesCompras (cotizacionId)
InOrdenesCompras ──────────► InOrdenEntrada (convertir)
InOrdenEntrada ────────────► InMovimiento (insert, tipo entrada)
InAjusteInventario ────────► InMovimiento (insert, tipo ajuste)
InTransferencia ───────────► InMovimiento ×2 (salida origen + entrada destino)
InRequisicion ─────────────► InTransferencia (requisicionId)
InMovimiento ──────────────► InInventario (trigger BEFORE INSERT)
InInventario ──────────────► InAlertaInventario (listener async AFTER_COMMIT)
InAlertaInventario ────────► SgNotificacion (SSE push al frontend)
InLote ────────────────────► InOrdenEntradaDetalleLote (recepción)
InSuplidor ────────────────► InOrdenesCompras (suplidorId)
InAlmacen ─────────────────► InOrdenEntrada, InTransferencia, InAjusteInventario
```

---

## Reglas específicas del módulo

### Siempre sobreescribir tenant en el service
```java
entity.setEmpresaId(TenantContext.getCurrentEmpresaId());
entity.setSucursalId(sgSucursalRepository.findById(TenantContext.getCurrentSucursalId()).orElseThrow());
entity.setUsuarioReg(TenantContext.getUsername());
entity.setFechaReg(LocalDateTime.now());
```

### Buscar almacén por nombre en JPQL (cuando se guarda solo el ID)
```java
"(SELECT a.nombre FROM InAlmacen a WHERE a.id = o.almacenId)"
```

### Insertar movimiento desde Java
```java
InMovimiento mov = new InMovimiento();
mov.setTipoMovimientoId(tipo.getId());
mov.setAlmacenId(almacenId);
mov.setProductoId(productoId);
mov.setCantidad(cantidad);        // El trigger normaliza el signo
mov.setLote(lote);                // null si sin lote
mov.setNumeroReferencia(docId);
mov.setEmpresaId(empresaId);
mov.setSucursalId(sucursalEntity);
mov.setFechaReg(LocalDateTime.now());
mov.setUsuarioReg(username);
// No fijar cantidadInventario — lo pone el trigger
movimientoDao.save(mov);
// Luego flush+refresh para leer cantidadInventario
```

### InLote — clave compuesta
El DAO recibe `(String lote, Long productoId)`. Al buscar lotes con stock, siempre filtrar por `empresaId` además de `almacenId`.

### Tipos de movimiento en ajustes
El `movimientoTipoId` que envía el frontend es validado en el service: verificar que existe en `InMovimientoTipo` antes de usarlo. El trigger lanzará excepción si no existe.

### Órdenes de compra: conversión a orden de entrada
Al convertir, el service:
1. Lee la `InOrdenesCompras` completa con detalles.
2. Crea `InOrdenEntrada` con el mismo `almacenId` del request.
3. Por cada detalle de compra crea un `InOrdenEntradaDetalle`.
4. Inserta el movimiento tipo "Entrada Compra".
5. Marca la orden de compra con `estadoId = CON` (convertida).

### Módulos con secuencia
Solo `InRequisicion` usa `secuencia`. Seguir el patrón de doble save de `CLAUDE.md`.

---

## Permisos por endpoint

```java
@RequierePermiso(menuUrl = "/inventario/almacenes",       accion = Accion.ESCRIBIR) // POST, PUT, DELETE
@RequierePermiso(menuUrl = "/inventario/suplidores",      accion = Accion.ESCRIBIR)
@RequierePermiso(menuUrl = "/inventario/ordenes-compras", accion = Accion.ESCRIBIR)
@RequierePermiso(menuUrl = "/inventario/orden-entrada",   accion = Accion.ESCRIBIR)
@RequierePermiso(menuUrl = "/inventario/ajustes",         accion = Accion.ESCRIBIR)
@RequierePermiso(menuUrl = "/inventario/transferencias",  accion = Accion.ESCRIBIR)
@RequierePermiso(menuUrl = "/inventario/requisiciones",   accion = Accion.ESCRIBIR)
@RequierePermiso(menuUrl = "/inventario/movimientos",     accion = Accion.ESCRIBIR)
```

Los endpoints `GET` y `POST /buscar` no requieren `@RequierePermiso`.

---

## Scripts de BD relevantes

| Archivo | Propósito |
|---|---|
| `db-migrations/create_in_requisicion.sql` | DDL tabla in_requisicion |
| `db-migrations/alter_cantidad_to_integer.sql` | Migración de cantidad a INTEGER |
| `db-migrations/add_idx_inv_estado_stock.sql` | Índice para stock crítico |
| `eFacturador/src/main/resources/db/trigger_inventario_multitenant.sql` | Trigger + función fn_actualiza_inventario_producto |
| `db-migrations/seed_100k_movimientos.sql` | Datos de prueba — solo dev |
