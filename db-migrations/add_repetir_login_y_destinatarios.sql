-- Soporte para recordatorios recurrentes y destinatarios específicos
-- Fecha: 2026-06-09

-- 1. Campos nuevos en sg_notificacion
ALTER TABLE general.sg_notificacion
    ADD COLUMN IF NOT EXISTS repetir_login    BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fecha_expiracion TIMESTAMPTZ;

-- repetir_login = FALSE (default): desaparece del login tras confirmarlo una vez
-- repetir_login = TRUE: aparece en cada login hasta fecha_expiracion
-- fecha_expiracion = NULL: sin límite de tiempo (solo se detiene por repetir_login=false + visto)

-- 2. Tabla de destinatarios específicos
CREATE TABLE IF NOT EXISTS general.sg_notificacion_destinatario (
    id              SERIAL PRIMARY KEY,
    notificacion_id INTEGER      NOT NULL REFERENCES general.sg_notificacion(id) ON DELETE CASCADE,
    username        VARCHAR(45)  NOT NULL,
    UNIQUE (notificacion_id, username)
);

CREATE INDEX IF NOT EXISTS idx_notif_dest_notif ON general.sg_notificacion_destinatario(notificacion_id);
CREATE INDEX IF NOT EXISTS idx_notif_dest_user  ON general.sg_notificacion_destinatario(username);

-- Si la notificación NO tiene filas en esta tabla → aplica la regla de acceso_restringido del tipo.
-- Si tiene filas → solo esos usuarios la ven, ignorando acceso_restringido.
