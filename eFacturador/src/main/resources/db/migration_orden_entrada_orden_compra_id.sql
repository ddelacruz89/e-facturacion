-- Agrega la referencia a la orden de compra de origen en la orden de entrada.
-- Ejecutar una sola vez en el schema inventario.

ALTER TABLE inventario.in_orden_entrada
    ADD COLUMN IF NOT EXISTS orden_compra_id INTEGER DEFAULT NULL;

COMMENT ON COLUMN inventario.in_orden_entrada.orden_compra_id
    IS 'ID de la orden de compra que originó esta orden de entrada. NULL si fue creada manualmente.';
