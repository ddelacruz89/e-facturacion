-- Agrega fecha tentativa de entrega a la orden de compra.
-- Ejecutar una sola vez en el schema inventario.

ALTER TABLE inventario.in_ordenes_compras
    ADD COLUMN IF NOT EXISTS fecha_entrega_tentativa DATE DEFAULT NULL;

COMMENT ON COLUMN inventario.in_ordenes_compras.fecha_entrega_tentativa
    IS 'Fecha en que se espera recibir el pedido. Usada para el tracking de entregas del día en el dashboard.';
