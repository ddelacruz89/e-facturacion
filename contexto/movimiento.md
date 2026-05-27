# Módulo de Movimientos de Inventario

## Trigger de actualización de inventario

El trigger `trg_actualiza_inventario` se ejecuta **BEFORE INSERT** en `inventario.in_movimientos` y ajusta el stock en tiempo real mediante la función `trg_fn_actualiza_inventario`.

### Trigger DDL
```sql
CREATE TRIGGER trg_actualiza_inventario
BEFORE INSERT ON inventario.in_movimientos
FOR EACH ROW EXECUTE FUNCTION inventario.trg_fn_actualiza_inventario();
```

### Función del trigger
```sql
CREATE OR REPLACE FUNCTION inventario.trg_fn_actualiza_inventario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_cr    BOOLEAN;
    v_cant  INTEGER;
BEGIN
    v_cant := NEW.cantidad;

    SELECT cr
      INTO v_cr
      FROM inventario.in_movimientos_tipos
     WHERE id = NEW.tipo_movimiento_id;

    IF v_cr IS NULL THEN
        RAISE EXCEPTION 'tipo_movimiento_id % no encontrado en in_movimientos_tipos',
            NEW.tipo_movimiento_id;
    END IF;

    IF v_cr AND v_cant < 0 THEN
        v_cant := ABS(v_cant);
    ELSIF NOT v_cr AND v_cant > 0 THEN
        v_cant := v_cant * -1;
    END IF;

    NEW.cantidad_inventario := inventario.fn_actualiza_inventario_producto(
        NEW.almacen_id,
        NEW.producto_id,
        v_cant,
        NEW.lote,
        NEW.empresa_id,
        NEW.sucursal_id
    );

    RETURN NEW;
END;
$function$;
```

### Lógica de ajuste de cantidad

- Lee el campo `cr` (crédito/débito) de `in_movimientos_tipos` según el `tipo_movimiento_id` del movimiento.
- **`cr = true` (entrada):** si la cantidad es negativa, la convierte a positiva (`ABS`).
- **`cr = false` (salida):** si la cantidad es positiva, la convierte a negativa (`* -1`).
- Llama a `inventario.fn_actualiza_inventario_producto(almacen_id, producto_id, cantidad_ajustada, lote, empresa_id, sucursal_id)` y guarda el resultado en `NEW.cantidad_inventario` (saldo resultante en inventario).

### Implicaciones para el backend

- **No actualizar stock manualmente desde Java.** Basta con insertar un registro en `in_movimientos`; el trigger ajusta el stock automáticamente.
- El campo `cantidad_inventario` en el movimiento es rellenado por el trigger, no por el service.
- El tipo de movimiento debe existir en `in_movimientos_tipos` antes de insertar; de lo contrario, el trigger lanza excepción.
- Los campos requeridos por el trigger en cada fila: `almacen_id`, `producto_id`, `cantidad`, `lote`, `empresa_id`, `sucursal_id`, `tipo_movimiento_id`.

---

## Sistema de alertas por límite mínimo de stock

### Modelo de datos

- **`producto.mg_producto_almacen_limite`** — límite por producto × almacén. Columnas: `limite` (Integer), `almacen_id`, `empresa_id`. FK a `mg_producto_unidad_suplidor`.
- El join completo para leer el límite de un producto es: `mg_producto_almacen_limite → mg_producto_unidad_suplidor → mg_producto`.
- **`inventario.in_inventarios`** — tiene la columna `estado_producto_inventario` (VARCHAR). Valores: `'BAJO'` | `'SALUDABLE'` | `NULL` (sin límite configurado). Se actualiza por producto × almacén (todos los lotes a la vez), no por lote individual.

### Evento Spring

Cada vez que `InMovimientoServiceImpl` registra un movimiento, publica un `InStockBajoEvent`:

```java
eventPublisher.publishEvent(new InStockBajoEvent(
    this,
    saved.getProductoId(),
    saved.getAlmacenId(),
    saved.getEmpresaId(),
    saved.getSucursalId() != null ? saved.getSucursalId().getId() : null,
    saved.getCantidadInventario()  // saldo del lote individual (no usado en el listener)
));
```

- `registrar()` (movimiento único) y `registrarTodos()` (transferencias, ajustes masivos) publican el evento.
- El evento se publica durante la transacción; el listener lo recibe **después del commit** (`AFTER_COMMIT`).

### Listener — `InAlertaInventarioListener`

```
listeners/InAlertaInventarioListener.java
```

Anotaciones:
```java
@Async("alertasExecutor")                                   // hilo separado
@TransactionalEventListener(phase = AFTER_COMMIT)           // corre post-commit
@Transactional(propagation = REQUIRES_NEW)                  // transacción propia
```

**Flujo interno:**

```
¿Límite configurado para (productoId, almacenId, empresaId)? → No → return
         ↓ Sí
totalStock = SUM(cantidad) de todos los lotes en in_inventarios
         ↓
totalStock < limite
  ├── sin notificación ACT → updateEstado='BAJO' + crear STOCK_BAJO + SSE push
  └── ya notificación ACT  → actualizar payload con nueva cantidad (sin nuevo push)

totalStock >= limite
  ├── sin notificación ACT → return  ← caso saludable normal, costo mínimo
  └── hay notificación ACT → updateEstado='SALUDABLE' + cerrar notificación (CER)
```

**Regla clave:** el límite se compara contra el **total sumado de todos los lotes** del producto en el almacén, nunca contra el saldo de un lote individual.

### Thread pool `alertasExecutor`

```java
corePoolSize  = 2
maxPoolSize   = 5
queueCapacity = 100
threadNamePrefix = "alerta-inv-"
```

### Costo por movimiento (background, no bloquea al usuario)

| Escenario | Queries | Writes |
|---|---|---|
| Sin límite configurado | 1 | 0 |
| Límite existe, stock OK, sin alerta activa | 3 | 0 |
| Primera vez que baja del límite | 3 | 2 |
| Sigue bajo (alerta ya activa) | 3 | 1 |
| Recuperación BAJO → SALUDABLE | 3 | 2 |

### Notificación generada

```
modulo        = "INVENTARIO"
tipo          = "STOCK_BAJO"
referenciaKey = "productoId:almacenId"
menuUrlOrigen = "/almacenes"
payload       = { productoId, productoNombre, almacenId, almacenNombre, cantidadActual, limite }
titulo        = "Stock bajo: {productoNombre} en {almacenNombre}"
```

### Repositorios involucrados

- `InAlertaLimiteRepository.findLimite(productoId, almacenId, empresaId)` — native query con join por `mg_producto_unidad_suplidor`
- `InInventarioRepository.sumCantidadByProductoAndAlmacen(productoId, almacenId, empresaId)` — JPQL SUM de todos los lotes
- `InInventarioRepository.updateEstadoByProductoAndAlmacen(...)` — JPQL UPDATE @Modifying, actualiza todos los lotes a la vez
- `SgNotificacionRepository.findByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId(...)` — deduplicación por `referenciaKey`

---

## Vista de stock crítico

### Backend

- `GET /api/v1/inventario/stock-arbol/stock-critico` — lista plana de producto-almacén cuyo stock total está por debajo del límite.
- Native query en `InStockArbolDaoImpl.findStockCritico(empresaId)`: join `mg_producto_almacen_limite → mg_producto_unidad_suplidor → mg_producto + in_almacen + LEFT JOIN in_inventarios`, filtra con `HAVING SUM(cantidad) < MAX(limite)`.
- DTO: `InStockCriticoDTO` — `{ productoId, productoNombre, almacenId, almacenNombre, cantidadActual, limite, faltante }`.

### `InStockArbolDaoImpl` — campos adicionales en JPQL

- Nivel 1 (productos): incluye `MIN(i.estadoProductoInventario)` → `estadoStock` en `InStockProductoNodoDTO`. `MIN('BAJO','SALUDABLE') = 'BAJO'`, así que si cualquier almacén está bajo, el producto muestra `BAJO`.
- Nivel 2 (almacenes): incluye `MAX(i.estadoProductoInventario)` → `estadoStock` en `InStockAlmacenNodoDTO`. Como todos los lotes del mismo producto-almacén tienen el mismo valor, MAX es correcto.

### Frontend

- `StockArbolView` — chip rojo "Stock bajo" aparece solo cuando `estadoStock === 'BAJO'` (nivel producto y nivel almacén). Si saludable o sin límite: no se muestra nada.
- `StockCriticoView` (`/stock-critico`) — tabla plana con columnas: Producto, Almacén, Stock actual, Límite, Faltante, Severidad. Severidad: **Crítico** (faltante ≥ 50% del límite) o **Bajo**.
- Índice BD: `idx_inv_estado_stock ON in_inventarios(empresa_id, estado_producto_inventario) WHERE estado_producto_inventario IS NOT NULL`.
