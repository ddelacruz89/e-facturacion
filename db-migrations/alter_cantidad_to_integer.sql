-- =============================================================================
-- MIGRACIÓN: cambiar columnas de cantidad de DOUBLE PRECISION a INTEGER
-- Afecta: in_movimientos, in_inventarios, in_ajuste_inventario_detalle
-- =============================================================================

-- in_movimientos.cantidad
ALTER TABLE inventario.in_movimientos
    ALTER COLUMN cantidad TYPE INTEGER USING cantidad::INTEGER;

-- in_inventarios.cantidad
ALTER TABLE inventario.in_inventarios
    ALTER COLUMN cantidad TYPE INTEGER USING cantidad::INTEGER;

-- in_ajuste_inventario_detalle
ALTER TABLE inventario.in_ajuste_inventario_detalle
    ALTER COLUMN cantidad_actual TYPE INTEGER USING cantidad_actual::INTEGER;

ALTER TABLE inventario.in_ajuste_inventario_detalle
    ALTER COLUMN cantidad_nueva TYPE INTEGER USING cantidad_nueva::INTEGER;

ALTER TABLE inventario.in_ajuste_inventario_detalle
    ALTER COLUMN diferencia TYPE INTEGER USING diferencia::INTEGER;

-- in_alerta_inventario.cantidad_actual
ALTER TABLE inventario.in_alerta_inventario
    ALTER COLUMN cantidad_actual TYPE INTEGER USING cantidad_actual::INTEGER;
