-- Lista blanca de IPs de login por empresa (opt-in: si no hay filas, no hay restricción)
CREATE TABLE IF NOT EXISTS seguridad.sg_empresa_ip_permitida (
    id          SERIAL        PRIMARY KEY,
    empresa_id  INTEGER       NOT NULL,
    ip_origen   VARCHAR(45)   NOT NULL,
    descripcion VARCHAR(100),
    activo      BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_reg   TIMESTAMP     NOT NULL DEFAULT NOW(),
    usuario_reg VARCHAR(20)   NOT NULL,
    CONSTRAINT uq_empresa_ip UNIQUE (empresa_id, ip_origen)
);

CREATE INDEX IF NOT EXISTS idx_ip_permitida_empresa
    ON seguridad.sg_empresa_ip_permitida (empresa_id, activo);

-- Agregar IP_NO_AUTORIZADA como motivo válido en sg_login_intento (solo documentativo)
-- Valores: CONTRASENA_INCORRECTA | USUARIO_BLOQUEADO | USUARIO_NO_EXISTE | IP_NO_AUTORIZADA
