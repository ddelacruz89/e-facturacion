-- Agrega el tipo de identificación al suplidor (C = Cédula, R = RNC)
ALTER TABLE inventario.in_suplidor
    ADD COLUMN IF NOT EXISTS tipo_identificacion VARCHAR(1);
