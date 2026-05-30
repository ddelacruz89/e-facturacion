-- Agrega campos de dirección estructurada para organización de rutas de despacho
-- Todos los campos son opcionales (nullable)
ALTER TABLE general.mg_cliente
    ADD COLUMN IF NOT EXISTS direccion_entrega VARCHAR(500),
    ADD COLUMN IF NOT EXISTS sector             VARCHAR(100),
    ADD COLUMN IF NOT EXISTS ciudad             VARCHAR(100),
    ADD COLUMN IF NOT EXISTS referencia         VARCHAR(300);

COMMENT ON COLUMN general.mg_cliente.direccion_entrega IS 'Dirección de entrega física (si difiere de la dirección fiscal)';
COMMENT ON COLUMN general.mg_cliente.sector             IS 'Sector o barrio — usado para agrupar rutas de despacho';
COMMENT ON COLUMN general.mg_cliente.ciudad             IS 'Ciudad de entrega';
COMMENT ON COLUMN general.mg_cliente.referencia         IS 'Indicaciones adicionales para el conductor (landmarks, notas, etc.)';
