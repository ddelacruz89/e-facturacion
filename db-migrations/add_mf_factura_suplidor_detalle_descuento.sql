-- Descuentos por renglón de factura suplidor
-- tipo = '$' → monto fijo; tipo = '%' → porcentaje del monto del ítem

CREATE TABLE IF NOT EXISTS facturacion.mf_factura_suplidor_detalle_descuento (
    id          SERIAL PRIMARY KEY,
    detalle_id  INTEGER       NOT NULL
                  REFERENCES facturacion.mf_factura_suplidor_detalle(id)
                  ON DELETE CASCADE,
    tipo        VARCHAR(1)    NOT NULL CHECK (tipo IN ('$', '%')),
    valor       NUMERIC(16,4) NOT NULL,   -- el % o el $ ingresado
    monto       NUMERIC(16,2) NOT NULL,   -- RD$ calculado
    empresa_id  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_fs_detalle_descuento_detalle
    ON facturacion.mf_factura_suplidor_detalle_descuento (detalle_id);
