-- Catálogo global de retenciones de ITBIS/ISR.
-- No lleva empresa_id ni sucursal_id — es compartido por todas las empresas.

CREATE TABLE IF NOT EXISTS general.mg_retenciones_itbis (
    id                  SERIAL PRIMARY KEY,
    descripcion         VARCHAR(50),
    valor               NUMERIC(10, 0)  NOT NULL DEFAULT 0,
    retener_cuenta_id   INTEGER REFERENCES contabilidad.mc_catalago_cuenta(id),
    retenido_cuenta_id  INTEGER REFERENCES contabilidad.mc_catalago_cuenta(id),
    comentario_factura  VARCHAR(500),
    al_total            BOOLEAN         NOT NULL DEFAULT FALSE,
    tipo_retencion      VARCHAR(45)     NOT NULL DEFAULT 'ITBIS'
);

-- Datos iniciales típicos RD
INSERT INTO general.mg_retenciones_itbis (descripcion, valor, comentario_factura, al_total, tipo_retencion)
VALUES
    ('Retención ITBIS 30%',  30, 'Sujeto a retención del 30% del ITBIS según Art. 309 del Código Tributario', false, 'ITBIS'),
    ('Retención ITBIS 100%', 100, 'Sujeto a retención del 100% del ITBIS',                                    false, 'ITBIS'),
    ('Retención ISR 10%',    10, 'Sujeto a retención del 10% del ISR según Art. 307 del Código Tributario',   true,  'ISR'),
    ('Retención ISR 5%',     5,  'Sujeto a retención del 5% del ISR',                                         true,  'ISR')
ON CONFLICT DO NOTHING;
