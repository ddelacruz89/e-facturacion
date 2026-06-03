-- Zonas geográficas de una ruta de entrega
-- Una ruta puede tener múltiples zonas (provincia → municipio → barrio opcional)
-- Si barrio_id es NULL, la zona incluye todos los barrios del municipio
CREATE TABLE IF NOT EXISTS despacho.de_ruta_zona (
    id           SERIAL PRIMARY KEY,
    ruta_id      INTEGER NOT NULL REFERENCES despacho.de_ruta_entrega(id),
    cod_provincia CHAR(2) NOT NULL REFERENCES general.mg_provincia(cod_provincia),
    municipio_id INTEGER NOT NULL REFERENCES general.mg_municipio(id),
    barrio_id    INTEGER REFERENCES general.mg_barrio_paraje(id)
);

CREATE INDEX IF NOT EXISTS idx_de_ruta_zona_ruta_id ON despacho.de_ruta_zona(ruta_id);
