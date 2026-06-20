-- ============================================================
-- Accesos de Soporte — eFacturador
-- Ejecutar una sola vez en la base de datos de producción.
-- La tabla sg_acceso_soporte es escrita por el sistema de
-- management; eFacturador solo la lee durante el login.
-- ============================================================

-- 1. Flag en sg_usuario que identifica cuentas de soporte.
--    Los usuarios soporte viven SOLO en empresa_id = 1 (SaaS admin).
ALTER TABLE seguridad.sg_usuario
  ADD COLUMN IF NOT EXISTS es_soporte BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Tabla de grants: el sistema de management escribe aquí
--    para autorizar a un usuario soporte a acceder a un tenant.
CREATE TABLE IF NOT EXISTS seguridad.sg_acceso_soporte (
  id                SERIAL          PRIMARY KEY,
  empresa_id        INTEGER         NOT NULL,   -- tenant que recibe soporte
  username_soporte  VARCHAR(20)     NOT NULL
                    REFERENCES seguridad.sg_usuario(username),
  otorgado_por      VARCHAR(100)    NOT NULL,   -- identificador en el mgmt system
  fecha_expiracion  TIMESTAMP       NOT NULL,   -- acceso expira automáticamente
  activo            BOOLEAN         NOT NULL DEFAULT TRUE,
  observaciones     VARCHAR(500),
  fecha_reg         TIMESTAMP       NOT NULL DEFAULT NOW(),
  usuario_reg       VARCHAR(100)    NOT NULL
);

-- Solo un grant activo por par (soporte + empresa) a la vez.
-- Para otorgar nuevo acceso, primero revocar el anterior.
CREATE UNIQUE INDEX IF NOT EXISTS uq_acceso_soporte_activo
  ON seguridad.sg_acceso_soporte (empresa_id, username_soporte)
  WHERE activo = TRUE;

-- Índice de búsqueda eficiente por usuario soporte (login)
CREATE INDEX IF NOT EXISTS idx_acceso_soporte_username
  ON seguridad.sg_acceso_soporte (username_soporte, activo, fecha_expiracion);

-- Índice de búsqueda por empresa (para el management system)
CREATE INDEX IF NOT EXISTS idx_acceso_soporte_empresa
  ON seguridad.sg_acceso_soporte (empresa_id, activo);

-- Comentarios de documentación
COMMENT ON TABLE seguridad.sg_acceso_soporte IS
  'Autoriza a un usuario de soporte (es_soporte=TRUE) a acceder a un tenant en modo solo-lectura. Escrito por el sistema de management; leído por eFacturador en el login.';

COMMENT ON COLUMN seguridad.sg_acceso_soporte.empresa_id IS
  'ID del tenant (empresa) al que se otorga acceso de soporte.';

COMMENT ON COLUMN seguridad.sg_acceso_soporte.username_soporte IS
  'Username del usuario de soporte (sg_usuario.username donde es_soporte=TRUE).';

COMMENT ON COLUMN seguridad.sg_acceso_soporte.otorgado_por IS
  'Identificador del operador en el sistema de management que otorgó el acceso.';

COMMENT ON COLUMN seguridad.sg_acceso_soporte.fecha_expiracion IS
  'El acceso deja de ser válido en esta fecha/hora. El login verifica esta columna.';
