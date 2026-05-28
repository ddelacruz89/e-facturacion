-- =============================================================================
-- Migración: agregar columna `categoria` a mg_tipo_comprobante
-- Permite filtrar el dropdown de tipo de comprobante por módulo:
--   FT = Facturación Terceros (compras de suplidores)
--   FV = Facturación Venta
-- =============================================================================

ALTER TABLE facturacion.mg_tipo_comprobante
    ADD COLUMN IF NOT EXISTS categoria VARCHAR(10);

-- FT: comprobantes usados en facturas de suplidores (compras)
UPDATE facturacion.mg_tipo_comprobante SET categoria = 'FT' WHERE id IN ('41', '43', '47');

-- FV: comprobantes usados en facturas de venta a clientes
UPDATE facturacion.mg_tipo_comprobante SET categoria = 'FV' WHERE id IN ('33', '34', '44', '45', '46');

CREATE INDEX IF NOT EXISTS idx_mg_tipo_comprobante_categoria
    ON facturacion.mg_tipo_comprobante (categoria);
