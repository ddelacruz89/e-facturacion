-- Feature Plan: habilitación comercial de features premium por empresa
-- Gestionado únicamente por el administrador del SaaS (empresaId = 1)
CREATE TABLE IF NOT EXISTS seguridad.sg_feature_plan (
    id          SERIAL PRIMARY KEY,
    empresa_id  INTEGER      NOT NULL REFERENCES seguridad.sg_empresa(id),
    feature_id  VARCHAR(50)  NOT NULL,
    habilitado  BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_reg   TIMESTAMP    NOT NULL DEFAULT NOW(),
    usuario_reg VARCHAR(100) NOT NULL,
    CONSTRAINT uq_feature_plan UNIQUE (empresa_id, feature_id)
);

-- Configuración del feature por parte de la empresa
-- Solo aplica si sg_feature_plan.habilitado = true para esa empresa
CREATE TABLE IF NOT EXISTS seguridad.sg_empresa_feature_config (
    id             SERIAL PRIMARY KEY,
    empresa_id     INTEGER      NOT NULL REFERENCES seguridad.sg_empresa(id),
    feature_id     VARCHAR(50)  NOT NULL,
    activo         BOOLEAN      NOT NULL DEFAULT FALSE,
    storage_tipo   VARCHAR(20),           -- 'AWS_S3', 'AZURE_BLOB', 'LOCAL'
    storage_config TEXT,                  -- JSON: credenciales del proveedor de almacenamiento
    fecha_reg      TIMESTAMP    NOT NULL DEFAULT NOW(),
    usuario_reg    VARCHAR(100) NOT NULL,
    CONSTRAINT uq_empresa_feature_config UNIQUE (empresa_id, feature_id)
);

-- Valores iniciales: el feature RECIBO_ENTREGA existe en el catálogo
-- (habilitar por empresa via la vista admin)
