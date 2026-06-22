-- Agrega soporte para notificaciones de login y suscripciones por usuario.
-- 1. Columna para_login en sg_notificacion
-- 2. Catálogo de tipos de notificación configurable
-- 3. Tabla de suscripciones por usuario

ALTER TABLE general.sg_notificacion
    ADD COLUMN IF NOT EXISTS para_login BOOLEAN DEFAULT FALSE;

-- Catálogo de tipos de notificación que el sistema puede emitir.
-- para_login        : el aviso aparece como modal al iniciar sesión.
-- acceso_restringido: TRUE → solo usuarios con el tipo marcado en su perfil reciben el aviso.
--                     FALSE → todos los usuarios del tenant reciben el aviso al login.
CREATE TABLE IF NOT EXISTS seguridad.sg_notificacion_tipo_config (
    tipo_id            VARCHAR(50)  PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    descripcion        TEXT,
    modulo             VARCHAR(30)  NOT NULL,
    para_login         BOOLEAN      NOT NULL DEFAULT TRUE,
    acceso_restringido BOOLEAN      NOT NULL DEFAULT FALSE,
    activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_reg          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    usuario_reg        VARCHAR(45)
);

-- Suscripciones: qué usuarios quieren recibir qué tipos de notificación al login.
CREATE TABLE IF NOT EXISTS seguridad.sg_usuario_notif_suscripcion (
    id          SERIAL       PRIMARY KEY,
    empresa_id  INTEGER      NOT NULL,
    username    VARCHAR(45)  NOT NULL,
    tipo_id     VARCHAR(50)  NOT NULL REFERENCES seguridad.sg_notificacion_tipo_config(tipo_id),
    fecha_reg   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (empresa_id, username, tipo_id)
);

CREATE INDEX IF NOT EXISTS idx_usr_notif_suscripcion_tenant
    ON seguridad.sg_usuario_notif_suscripcion (empresa_id, username);

-- Seed: tipos iniciales
-- acceso_restringido=TRUE  → solo usuarios con el tipo marcado en su perfil lo reciben
-- acceso_restringido=FALSE → lo reciben todos los usuarios (por defecto, tipos generales)
INSERT INTO seguridad.sg_notificacion_tipo_config
    (tipo_id, nombre, descripcion, modulo, para_login, acceso_restringido, activo, usuario_reg)
VALUES
  ('COBRO_VENCIDO',        'Clientes con pagos vencidos',          'Clientes que tienen facturas vencidas sin pagar',               'FACTURACION', TRUE,  TRUE,  TRUE, 'SISTEMA'),
  ('STOCK_BAJO',           'Stock por debajo del mínimo',          'Productos cuya cantidad en almacén está por debajo del límite',  'INVENTARIO',  TRUE,  FALSE, TRUE, 'SISTEMA'),
  ('VENCIMIENTO',          'Lotes próximos a vencer',              'Lotes con fecha de vencimiento en los próximos días',           'INVENTARIO',  TRUE,  FALSE, TRUE, 'SISTEMA'),
  ('REQUISICION_PENDIENTE','Requisiciones pendientes',             'Requisiciones de transferencia esperando aprobación',           'INVENTARIO',  TRUE,  TRUE,  TRUE, 'SISTEMA'),
  ('APROBACION_PENDIENTE', 'Aprobaciones pendientes',              'Documentos esperando aprobación',                               'APROBACIONES',TRUE,  TRUE,  TRUE, 'SISTEMA')
ON CONFLICT (tipo_id) DO NOTHING;
