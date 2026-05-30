-- Agrega campo envio a facturas de cliente
-- Una factura con envio = true y estadoId = 'PAG' es elegible para crear una orden de despacho.
ALTER TABLE facturacion.mf_factura
    ADD COLUMN IF NOT EXISTS envio BOOLEAN DEFAULT FALSE;
