-- =============================================================================
-- Módulo de Aprobaciones
-- =============================================================================
-- Ejecutar en orden: tablas primero, luego índices, luego sg_menu.
-- Requiere: seguridad.sg_usuario (ya existe), general.sg_sucursal (ya existe).
-- =============================================================================

-- ── 1. Campo manager en sg_usuario ───────────────────────────────────────────

ALTER TABLE seguridad.sg_usuario
    ADD COLUMN IF NOT EXISTS manager_username VARCHAR(20)
        REFERENCES seguridad.sg_usuario(username);

-- ── 2. Configuración de aprobación ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seguridad.sg_config_aprobacion (
    id              SERIAL          PRIMARY KEY,
    empresa_id      INTEGER         NOT NULL,
    secuencia       INTEGER,
    tipo_documento  VARCHAR(50)     NOT NULL,
    nombre          VARCHAR(200)    NOT NULL,
    modo_aprobacion VARCHAR(20)     NOT NULL DEFAULT 'SECUENCIAL',
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    usuario_reg     VARCHAR(20)     NOT NULL,
    fecha_reg       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Un solo tipo de documento activo por empresa
CREATE UNIQUE INDEX IF NOT EXISTS uq_config_apr_tipo_empresa
    ON seguridad.sg_config_aprobacion(empresa_id, tipo_documento)
    WHERE activo = TRUE;

-- ── 3. Niveles / aprobadores de cada configuración ───────────────────────────

CREATE TABLE IF NOT EXISTS seguridad.sg_config_aprobacion_nivel (
    id                  SERIAL      PRIMARY KEY,
    config_id           INTEGER     NOT NULL
        REFERENCES seguridad.sg_config_aprobacion(id) ON DELETE CASCADE,
    empresa_id          INTEGER     NOT NULL,
    nivel               INTEGER     NOT NULL DEFAULT 1,
    aprobador_username  VARCHAR(20)
        REFERENCES seguridad.sg_usuario(username),
    usa_manager         BOOLEAN     NOT NULL DEFAULT FALSE,
    usuario_reg         VARCHAR(20),
    fecha_reg           TIMESTAMP   NOT NULL DEFAULT NOW(),
    -- Debe tener aprobador fijo O usa_manager=true
    CONSTRAINT chk_nivel_aprobador CHECK (aprobador_username IS NOT NULL OR usa_manager = TRUE)
);

CREATE INDEX IF NOT EXISTS idx_config_apr_nivel_config
    ON seguridad.sg_config_aprobacion_nivel(config_id);

-- ── 4. Solicitud de aprobación (runtime) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS seguridad.sg_aprobacion (
    id                  SERIAL      PRIMARY KEY,
    empresa_id          INTEGER     NOT NULL,
    sucursal_id         INTEGER     REFERENCES general.sg_sucursal(id),
    tipo_documento      VARCHAR(50) NOT NULL,
    documento_id        INTEGER     NOT NULL,
    config_id           INTEGER     NOT NULL
        REFERENCES seguridad.sg_config_aprobacion(id),
    solicitante_username VARCHAR(20) NOT NULL
        REFERENCES seguridad.sg_usuario(username),
    modo_aprobacion     VARCHAR(20) NOT NULL,
    estado_id           VARCHAR(20) NOT NULL DEFAULT 'PEN',
    comentario_final    TEXT,
    fecha_solicitud     TIMESTAMP   NOT NULL DEFAULT NOW(),
    fecha_resolucion    TIMESTAMP,
    usuario_reg         VARCHAR(20) NOT NULL,
    fecha_reg           TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aprobacion_doc
    ON seguridad.sg_aprobacion(empresa_id, tipo_documento, documento_id);

CREATE INDEX IF NOT EXISTS idx_aprobacion_estado
    ON seguridad.sg_aprobacion(empresa_id, estado_id);

-- ── 5. Detalle de aprobación (un registro por aprobador) ─────────────────────

CREATE TABLE IF NOT EXISTS seguridad.sg_aprobacion_detalle (
    id                  SERIAL      PRIMARY KEY,
    aprobacion_id       INTEGER     NOT NULL
        REFERENCES seguridad.sg_aprobacion(id) ON DELETE CASCADE,
    empresa_id          INTEGER     NOT NULL,
    nivel               INTEGER     NOT NULL DEFAULT 1,
    aprobador_username  VARCHAR(20) NOT NULL
        REFERENCES seguridad.sg_usuario(username),
    es_manager          BOOLEAN     NOT NULL DEFAULT FALSE,
    estado_id           VARCHAR(20) NOT NULL DEFAULT 'PEN',
    comentario          TEXT,
    fecha_respuesta     TIMESTAMP,
    usuario_reg         VARCHAR(20),
    fecha_reg           TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apr_detalle_aprobacion
    ON seguridad.sg_aprobacion_detalle(aprobacion_id);

CREATE INDEX IF NOT EXISTS idx_apr_detalle_aprobador
    ON seguridad.sg_aprobacion_detalle(aprobador_username, estado_id);

-- ── 6. Registrar entradas en sg_menu ─────────────────────────────────────────
-- Ajusta empresa_id y orden según tu BD. Verifica que el modulo_id 'SEG' exista.

INSERT INTO seguridad.sg_menu (modulo_id, menu, url, activo, orden, empresa_id, fecha_reg, usuario_reg)
VALUES
    ('SEG', 'Config. Aprobaciones', '/aprobaciones-config',  TRUE, 61, 1, NOW(), 'admin'),
    ('SEG', 'Bandeja Aprobaciones', '/aprobaciones-bandeja', TRUE, 62, 1, NOW(), 'admin')
ON CONFLICT DO NOTHING;

-- ── 7. Dar permiso al rol administrador (ajusta rol_id según tu BD) ───────────

DO $$
DECLARE
    menu_config_id  INTEGER;
    menu_bandeja_id INTEGER;
    rol_admin_id    INTEGER := 1;  -- ← ajustar al id real del rol admin
    emp_id          INTEGER := 1;  -- ← ajustar al id real de la empresa
BEGIN
    SELECT id INTO menu_config_id  FROM seguridad.sg_menu WHERE url = '/aprobaciones-config'  LIMIT 1;
    SELECT id INTO menu_bandeja_id FROM seguridad.sg_menu WHERE url = '/aprobaciones-bandeja' LIMIT 1;

    IF menu_config_id IS NOT NULL THEN
        INSERT INTO seguridad.sg_permiso
            (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, fecha_reg, usuario_reg)
        VALUES
            (emp_id, rol_admin_id, menu_config_id,  TRUE, TRUE, TRUE,  FALSE, NOW(), 'admin'),
            (emp_id, rol_admin_id, menu_bandeja_id, TRUE, TRUE, FALSE, FALSE, NOW(), 'admin')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
