# Módulo de Transferencia de Inventario — Contexto técnico

## Propósito

Permite mover productos entre almacenes de la misma empresa, registrando la salida del almacén origen y la entrada al almacén destino. Soporta tracking por lote, unidades fraccionarias y detección de transferencias parciales por stock insuficiente al momento de guardar.

Flujo de estados: `PEN → APR / INA`

---

## Base de datos (PostgreSQL, schema `inventario`)

### `inventario.in_transferencias`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Clave interna |
| `empresa_id` | INTEGER | Tenant |
| `sucursal_id` | INTEGER FK → `seguridad.sg_sucursales(id)` | Sucursal del tenant |
| `origen_almacen_id` | INTEGER FK → `inventario.in_almacenes(id)` | Almacén que provee los productos |
| `destino_almacen_id` | INTEGER FK → `inventario.in_almacenes(id)` | Almacén que recibe los productos |
| `estado_id` | VARCHAR | `PEN` \| `APR` \| `INA` — default `PEN` |
| `usuario_reg` | VARCHAR(100) | |
| `fecha_reg` | TIMESTAMP | |

### `inventario.in_transferecias_detalles` *(typo en el nombre de tabla, así está en BD)*

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `transferencia_id` | INTEGER FK → `in_transferencias(id)` | |
| `producto_id` | INTEGER FK → `mg_productos(id)` | |
| `cant` | INTEGER | Cantidad **realmente** transferida (ajustada al stock disponible al guardar) |
| `cant_solicitada` | INTEGER | Cantidad que el usuario solicitó. Permite detectar transferencias parciales |
| `lote` | VARCHAR | Nullable — lote del stock a mover |
| `numero_referencia` | INTEGER | ID de la transferencia (se usa como referencia en movimientos) |
| `cantidad_unidad` | INTEGER | Unidades-fracción por unidad-base (ej: 10 si Caja × 10 Und) |
| `unidad_descripcion` | VARCHAR(50) | Descripción textual de la unidad |

### Movimientos generados automáticamente

Al guardar, el service crea un par de `InMovimiento` por cada detalle con `cant > 0`:

| Tipo | `tipo_movimiento_id` | Almacén | Cantidad |
|---|---|---|---|
| Salida del origen | `3` (`TIPO_SALIDA_TRANSFERENCIA`) | `origen_almacen_id` | `-cant` (negativo) |
| Entrada al destino | `2` (`TIPO_ENTRADA_TRANSFERENCIA`) | `destino_almacen_id` | `+cant` (positivo) |

El trigger `trg_actualiza_inventario` actualiza `in_inventarios` atómicamente al insertar el movimiento.

---

## Backend Java

### Paquetes

| Artefacto | Ruta |
|---|---|
| Entidad header | `jpa/inventario/InTransferencia.java` |
| Entidad detalle | `jpa/inventario/InTransferenciaDetalle.java` |
| DTO request | `dto/inventario/InTransferenciaRequestDTO.java` |
| DTO lotes stock | `dto/inventario/InProductoLotesStockDTO.java` |
| Service interface | `interfaces/inventario/InTransferenciaService.java` |
| Service impl | `services/inventario/InTransferenciaServiceImpl.java` |
| Controller | `controllers/inventario/InTransferenciaController.java` |
| Repository | `dao/inventario/InTransferenciaRepository.java` |

### Entidad `InTransferencia`
- Extiende `BaseSucursal` (tiene `empresaId`, `sucursalId`, `usuarioReg`, `fechaReg`, `estadoId`)
- `origenAlmacenId` y `destinoAlmacenId` son `@ManyToOne` a `InAlmacen` (no enteros planos)
- `@OneToMany(cascade = CascadeType.ALL, mappedBy = "transferenciaId", fetch = FetchType.EAGER)`
- `@JsonIdentityInfo` en el header, `@JsonIgnoreProperties({"detalles"})` en el detalle

### Entidad `InTransferenciaDetalle`
- `@JsonIgnoreProperties({"detalles"})` en el lado `@ManyToOne` hacia `InTransferencia`
- `@JsonIgnoreProperties({...})` en `productoId` para evitar serializar relaciones lazy del producto

### Service — puntos clave

**Creación (`create`)**
1. Resuelve `InAlmacen` origen y destino por ID y empresaId — lanza `RecordNotFoundException` si no existen
2. Valida que origen ≠ destino
3. Llama `buildDetalles()` que **ajusta `cant` al stock real en ese instante** usando `resolveStockParaDetalle()`
4. Guarda la transferencia
5. Genera un par salida/entrada en `InMovimiento` para cada detalle con `cant > 0`
6. Los movimientos se registran todos con `movimientoService.registrarTodos()`

**Transferencia parcial**
- Si el stock disponible al guardar es menor al solicitado: `cantTransferida = Math.min(cantSolicitada, stockDisponible)`
- `cantSolicitada` siempre guarda lo que el usuario pidió; `cant` guarda lo realmente movido
- El frontend detecta parciales comparando `cantSolicitada > cant` en el resultado y muestra un diálogo de advertencia

**Stock por lote (`getLotesConStockEnAlmacen`)**
- Devuelve `totalDisponible` + lista de lotes con su cantidad individual (solo con stock > 0)
- Incluye info de unidad del producto: `unidadNombre`, `unidadSigla`, `cantidadUnidad`, `esFraccionario`

### Controller REST

URL base: `api/v1/inventario/transferencias`  
Permiso: `@RequierePermiso(menuUrl = "/inventario/transferencias")`

| Verbo | Ruta | Descripción |
|---|---|---|
| GET | `/` | Todas las activas (no INA) |
| GET | `/all` | Todas incluidas anuladas |
| GET | `/{id}` | Por ID |
| POST | `/` | Crear (ESCRIBIR) |
| PUT | `/{id}` | Actualizar (ESCRIBIR) |
| DELETE | `/{id}` | Anular → `estadoId = "INA"` (ELIMINAR) |
| GET | `/stock?productoId&almacenId` | Stock total del producto en el almacén |
| GET | `/lotes-stock?productoId&almacenId` | Stock desglosado por lote + info de unidad |

---

## Frontend React/TypeScript

### Archivos

| Artefacto | Ruta |
|---|---|
| Modelos TS | `src/models/inventario/transferencia.tsx` |
| API client | `src/apis/TransferenciaController.tsx` |
| Vista | `src/components/inventario/TransferenciaView.tsx` |
| Ruta | `src/App.tsx` → `<Route path="inventario/transferencias" element={<TransferenciaView />} />` |

### Modelos TS

```typescript
interface InTransferenciaDetalle {
    id?, productoId, cant, cantSolicitada?, lote?, 
    numeroReferencia?, cantidadUnidad?, unidadDescripcion?
}
interface InTransferencia {
    id?, origenAlmacenId, destinoAlmacenId, estadoId?, 
    empresaId?, usuarioReg?, fechaReg?, detalles[]
}
interface InTransferenciaRequestDTO {
    origenAlmacenId: number, destinoAlmacenId: number,
    estadoId?, detalles[]
}
```

### API client (`TransferenciaController.tsx`)
- `BASE_URL = "/api/v1/inventario/transferencias"`
- `getTransferencias()` — GET / (solo activas)
- `getTransferencia(id)` — GET /{id}
- `createTransferencia(data)` — POST
- `updateTransferencia(id, data)` — PUT /{id}
- `anularTransferencia(id)` — DELETE /{id}
- `getStockProductoEnAlmacen(productoId, almacenId)` — GET /stock
- `getLotesConStockEnAlmacen(productoId, almacenId)` — GET /lotes-stock

### Formulario interno (`TransferenciaForm`)

```typescript
interface DetalleForm {
    productoId: any;   // objeto producto o ID numérico
    cant: number;
    lote: string;      // "" = sin lote (SIN_LOTE sentinel)
    cantidadUnidad?: number;
    unidadDescripcion?: string;
}
```

### Flujo de lotes en la UI
1. Al seleccionar un producto en una fila, se llama `cargarLotes(index, productoId, origenId)`
2. `cargarLotes` llama `getLotesConStockEnAlmacen` y puebla `lotesMap[index]`
3. El primer lote disponible se auto-selecciona
4. La columna "Stock lote" muestra el stock del lote seleccionado
5. Si `cant > stockLote` → campo en error, botón Guardar bloqueado
6. Al cambiar el almacén origen, se recargan los lotes de todas las filas existentes

### Integración con Requisiciones
- El botón **Requisición** en el ActionBar abre `SEARCH_CONFIGS.REQUISICION`
- Al seleccionar una requisición se llama `getRequisicion(id)` y se mapea al formulario:
  - `almacenOrigenId` (req) → `origenAlmacenId` (transferencia)
  - `almacenSolicitanteId` (req) → `destinoAlmacenId` (transferencia)
  - `detalles[].cantidadSolicitada` → `detalles[].cant`
- Cuando hay requisición cargada (`requisicionCargada !== null`), los `AlmacenComboBox` quedan **deshabilitados** — los almacenes no se pueden cambiar
- El Alert informativo muestra: `Requisición #X — Origen: [...] → Destino (solicitante): [...]`
- Al presionar **Nuevo** se limpia `requisicionCargada` y los selects se rehabilitan

### Botones del ActionBar (paleta monocromática)

| Botón | Color |
|---|---|
| Guardar | `#526671` (teal) |
| Nuevo | `#525271` (violeta-gris) |
| Requisición | `#715D52` (naranja-tierra) |
| Ver transferencias | `#716752` (dorado-cálido) |

Ver paleta completa en `contexto/coloresapp.md`.

### Estados visibles

| Estado | Chip color |
|---|---|
| PEN | warning |
| APR | success |
| INA | error |
