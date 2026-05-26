-- Vincula una transferencia con la requisición que la originó
ALTER TABLE inventario.in_transferencias
    ADD COLUMN IF NOT EXISTS requisicion_id INTEGER
        REFERENCES inventario.in_requisicion(id);

CREATE INDEX IF NOT EXISTS idx_transferencia_requisicion
    ON inventario.in_transferencias(requisicion_id);
