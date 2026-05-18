-- =============================================================================
-- MIGRACIÓN: TR_ACTUALIZA_INVENTARIO + spActualizaInventarioProducto
-- MySQL → PostgreSQL · Schema: inventario · Multi-tenant (empresa_id + sucursal_id)
--
-- CAMBIOS RESPECTO AL ORIGINAL:
--   · Toda query a in_inventarios filtra por empresa_id Y sucursal_id
--   · Comparación de lote usa IS NOT DISTINCT FROM (NULL-safe) en lugar de =
--   · cr es BOOLEAN en PostgreSQL (TRUE/FALSE), no INT (1/0)
--   · Convención de signo: la app envía `cantidad` ya firmada en in_movimientos
--       (positivo = entrada al stock, negativo = salida del stock)
--     El trigger valida la coherencia con cr y normaliza si es necesario:
--       · tipo cr=TRUE  → cantidad debe ser positiva (entrada)
--       · tipo cr=FALSE → cantidad debe ser negativa (salida)
--     Esto protege inserciones directas al DB que no respeten la convención.
--   · SP convertido a FUNCTION (PostgreSQL no tiene CALL para triggers)
--
-- IMPORTANTE – CONFLICTO CON JAVA:
--   InAjusteInventarioServiceImpl actualiza in_inventarios ANTES de insertar
--   in_movimientos. Con este trigger activo se produciría doble actualización.
--   Ver sección "CAMBIO REQUERIDO EN JAVA" al final del archivo.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. FUNCIÓN: fn_actualiza_inventario_producto
--    Equivale al stored procedure spActualizaInventarioProducto
--    Retorna el stock resultante (DOUBLE PRECISION) para que el trigger
--    lo asigne a NEW.cantidad_inventario.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION inventario.fn_actualiza_inventario_producto(
    p_almacen_id    INTEGER,
    p_producto_id   INTEGER,
    p_cantidad      INTEGER,            -- delta ya firmado (+ entrada / - salida)
    p_lote          VARCHAR(45),        -- NULL = sin lote
    p_empresa_id    INTEGER,
    p_sucursal_id   INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql AS
$fn_inv$
DECLARE
    v_existe  INTEGER;
    v_stock   INTEGER;
BEGIN
    -- IS NOT DISTINCT FROM hace comparación NULL-safe:
    --   lote IS NOT DISTINCT FROM NULL  →  equivale a  lote IS NULL
    --   lote IS NOT DISTINCT FROM 'L01' →  equivale a  lote = 'L01'
    SELECT COUNT(1), COALESCE(SUM(cantidad), 0)::INTEGER
      INTO v_existe, v_stock
      FROM inventario.in_inventarios
     WHERE producto_id  = p_producto_id
       AND almacen_id   = p_almacen_id
       AND empresa_id   = p_empresa_id
       AND sucursal_id  = p_sucursal_id
       AND lote IS NOT DISTINCT FROM p_lote;

    IF v_existe > 0 THEN
        v_stock := v_stock + p_cantidad;

        UPDATE inventario.in_inventarios
           SET cantidad = v_stock
         WHERE producto_id  = p_producto_id
           AND almacen_id   = p_almacen_id
           AND empresa_id   = p_empresa_id
           AND sucursal_id  = p_sucursal_id
           AND lote IS NOT DISTINCT FROM p_lote;
    ELSE
        v_stock := p_cantidad;

        INSERT INTO inventario.in_inventarios (
            almacen_id,
            producto_id,
            cantidad,
            lote,
            estado_producto_inventario,
            estado_id,
            empresa_id,
            sucursal_id,
            usuario_reg,
            fecha_reg
        ) VALUES (
            p_almacen_id,
            p_producto_id,
            p_cantidad,
            p_lote,
            'NORMAL',
            'ACT',
            p_empresa_id,
            p_sucursal_id,
            'TRIGGER',
            NOW()
        );
    END IF;

    RETURN v_stock;
END;
$fn_inv$;


-- ---------------------------------------------------------------------------
-- 2. FUNCIÓN DEL TRIGGER: trg_fn_actualiza_inventario
--    Se ejecuta BEFORE INSERT en inventario.in_movimientos.
--    Equivale al trigger TR_ACTUALIZA_INVENTARIO_BEFORE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION inventario.trg_fn_actualiza_inventario()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$trg_inv$
DECLARE
    v_cr    BOOLEAN;
    v_cant  INTEGER;
BEGIN
    v_cant := NEW.cantidad;

    -- Leer cr del tipo de movimiento (catálogo global, sin filtro de tenant)
    SELECT cr
      INTO v_cr
      FROM inventario.in_movimientos_tipos
     WHERE id = NEW.tipo_movimiento_id;

    IF v_cr IS NULL THEN
        RAISE EXCEPTION
            'tipo_movimiento_id % no encontrado en in_movimientos_tipos',
            NEW.tipo_movimiento_id;
    END IF;

    -- Normalizar signo según cr:
    --   cr = TRUE  (entrada) → cantidad debe ser positiva
    --   cr = FALSE (salida)  → cantidad debe ser negativa
    IF v_cr AND v_cant < 0 THEN
        v_cant := ABS(v_cant);
    ELSIF NOT v_cr AND v_cant > 0 THEN
        v_cant := v_cant * -1;
    END IF;

    -- Actualizar/crear inventario y obtener stock resultante
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
$trg_inv$;


-- ---------------------------------------------------------------------------
-- 3. TRIGGER: trg_actualiza_inventario
--    BEFORE INSERT → puede modificar NEW antes de que se persista la fila.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_actualiza_inventario ON inventario.in_movimientos;

CREATE TRIGGER trg_actualiza_inventario
    BEFORE INSERT ON inventario.in_movimientos
    FOR EACH ROW
    EXECUTE FUNCTION inventario.trg_fn_actualiza_inventario();


-- =============================================================================
-- CAMBIO REQUERIDO EN JAVA — InAjusteInventarioServiceImpl
-- =============================================================================
-- Con el trigger activo, el service NO debe actualizar in_inventarios
-- manualmente. El trigger lo hace al momento de insertar in_movimientos.
--
-- Eliminar (o comentar) estas líneas del método aplicar():
--
--   ❌  inv.setCantidad(dto.getCantidadNueva());
--   ❌  inventarioRepository.save(inv);
--   ❌  mov.setCantidadInventario(dto.getCantidadNueva().intValue());
--       (el trigger lo calcula y lo asigna; JPA lo leerá del registro guardado)
--
-- Mantener la lectura de inventario (para calcular la diferencia):
--
--   ✔  InInventario inv = inventarioRepository.findByProductoAlmacenLote(...).orElseThrow(...);
--   ✔  double cantidadActual = inv.getCantidad() != null ? inv.getCantidad() : 0.0;
--   ✔  double diferencia = dto.getCantidadNueva() - cantidadActual;
--   ✔  mov.setCantidad(diferencia);   ← delta firmado; trigger lo normaliza
-- =============================================================================
