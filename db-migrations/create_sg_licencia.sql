-- ============================================================
-- Módulo: Licencias
-- Descripción: Límites por empresa y módulos contratados
-- ============================================================

-- Licencia principal por empresa (max usuarios, max sucursales, vencimiento)
CREATE TABLE IF NOT EXISTS seguridad.sg_licencia (
    id               SERIAL PRIMARY KEY,
    empresa_id       INTEGER      NOT NULL UNIQUE REFERENCES seguridad.sg_empresa(id),
    max_usuarios     INTEGER      NOT NULL DEFAULT 5,
    max_sucursales   INTEGER      NOT NULL DEFAULT 1,
    fecha_vencimiento DATE,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_reg        TIMESTAMP    NOT NULL,
    usuario_reg      VARCHAR(100) NOT NULL
);

COMMENT ON TABLE  seguridad.sg_licencia                  IS 'Límites y vigencia de licencia por empresa';
COMMENT ON COLUMN seguridad.sg_licencia.max_usuarios     IS 'Máximo de usuarios activos permitidos';
COMMENT ON COLUMN seguridad.sg_licencia.max_sucursales   IS 'Máximo de sucursales permitidas';
COMMENT ON COLUMN seguridad.sg_licencia.fecha_vencimiento IS 'NULL = sin vencimiento';

-- Módulos habilitados por empresa según contrato
CREATE TABLE IF NOT EXISTS seguridad.sg_licencia_modulo (
    id         SERIAL PRIMARY KEY,
    empresa_id INTEGER      NOT NULL REFERENCES seguridad.sg_empresa(id),
    modulo_id  VARCHAR(5)   NOT NULL REFERENCES seguridad.sg_modulo(id),
    activo     BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_reg  TIMESTAMP    NOT NULL,
    usuario_reg VARCHAR(100) NOT NULL,
    CONSTRAINT uq_licencia_modulo UNIQUE (empresa_id, modulo_id)
);

COMMENT ON TABLE seguridad.sg_licencia_modulo IS 'Módulos (DE, FA, IN, etc.) habilitados por empresa';

-- ============================================================
-- Datos de ejemplo: insertar desde aquí para configurar
-- ============================================================
-- Licencia básica para empresa 2 (5 usuarios, 2 sucursales)
-- INSERT INTO seguridad.sg_licencia (empresa_id, max_usuarios, max_sucursales, activo, fecha_reg, usuario_reg)
-- VALUES (2, 5, 2, TRUE, NOW(), 'Master');

-- Habilitar módulo FA (facturación) para empresa 2
-- INSERT INTO seguridad.sg_licencia_modulo (empresa_id, modulo_id, activo, fecha_reg, usuario_reg)
-- VALUES (2, 'FA', TRUE, NOW(), 'Master');
