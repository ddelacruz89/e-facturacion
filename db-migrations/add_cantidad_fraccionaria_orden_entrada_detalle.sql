-- =============================================================================
-- MIGRACIÓN: Agregar cantidad_fraccionaria en in_orden_entrada_detalle
-- Propósito: Almacenar la cantidad expresada en unidad de fracción (inventario)
--            para productos fraccionarios.
--            Para productos enteros: igual a "cantidad".
--            Para productos fraccionarios: cantidad × unidad_entrada_fraccion_cantidad.
-- =============================================================================

ALTER TABLE inventario.in_orden_entrada_detalle
    ADD COLUMN IF NOT EXISTS cantidad_fraccionaria INTEGER;

-- Backfill: para registros existentes, cantidad_fraccionaria = cantidad
-- (todos los registros históricos se tratan como enteros)
UPDATE inventario.in_orden_entrada_detalle
   SET cantidad_fraccionaria = cantidad
 WHERE cantidad_fraccionaria IS NULL;

COMMENT ON COLUMN inventario.in_orden_entrada_detalle.cantidad_fraccionaria
    IS 'Cantidad en unidad de fracción (unidad de inventario). '
       'Para fraccionarios: cantidad × unidad_entrada_fraccion_cantidad. '
       'Para enteros: igual a cantidad. '
       'Es la cantidad que se registra en el movimiento de inventario.';
