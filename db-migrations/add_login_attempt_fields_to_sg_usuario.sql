-- Historial de intentos de login (auditoría + base para rate limiting distribuido)
CREATE TABLE IF NOT EXISTS seguridad.sg_login_intento (
    id             BIGSERIAL    PRIMARY KEY,
    username       VARCHAR(20)  NOT NULL,
    ip_origen      VARCHAR(45),
    fecha_intento  TIMESTAMP    NOT NULL DEFAULT NOW(),
    exitoso        BOOLEAN      NOT NULL DEFAULT FALSE,
    motivo_rechazo VARCHAR(30)
    -- Valores de motivo_rechazo: CONTRASENA_INCORRECTA | USUARIO_BLOQUEADO | USUARIO_NO_EXISTE
);

CREATE INDEX IF NOT EXISTS idx_login_intento_username_fecha
    ON seguridad.sg_login_intento (username, fecha_intento);

-- Estado de bloqueo en sg_usuario (2 columnas, lectura rápida sin contar filas)
ALTER TABLE seguridad.sg_usuario
    ADD COLUMN IF NOT EXISTS login_locked_until  TIMESTAMP,
    ADD COLUMN IF NOT EXISTS login_escalated     BOOLEAN NOT NULL DEFAULT FALSE;
