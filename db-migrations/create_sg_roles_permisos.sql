-- ============================================================
-- Módulo de Roles y Permisos
-- ============================================================

-- 1. Roles (nivel empresa)
CREATE TABLE seguridad.sg_rol (
    id          SERIAL PRIMARY KEY,
    empresa_id  INTEGER      NOT NULL,
    secuencia   INTEGER,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_reg   TIMESTAMP    NOT NULL DEFAULT NOW(),
    usuario_reg VARCHAR(50)  NOT NULL,
    CONSTRAINT uq_sg_rol_empresa_nombre UNIQUE (empresa_id, nombre)
);

-- 2. Permisos por rol y menú (nivel empresa)
--    Un registro por cada menú que el rol tiene acceso.
--    Menus sin registro = sin acceso.
CREATE TABLE seguridad.sg_permiso (
    id             SERIAL PRIMARY KEY,
    empresa_id     INTEGER   NOT NULL,
    secuencia      INTEGER,
    rol_id         INTEGER   NOT NULL REFERENCES seguridad.sg_rol(id),
    menu_id        INTEGER   NOT NULL REFERENCES seguridad.sg_menu(id),
    puede_leer     BOOLEAN   NOT NULL DEFAULT FALSE,
    puede_escribir BOOLEAN   NOT NULL DEFAULT FALSE,
    puede_eliminar BOOLEAN   NOT NULL DEFAULT FALSE,
    puede_imprimir BOOLEAN   NOT NULL DEFAULT FALSE,
    activo         BOOLEAN   NOT NULL DEFAULT TRUE,
    fecha_reg      TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_reg    VARCHAR(50) NOT NULL,
    CONSTRAINT uq_sg_permiso_rol_menu UNIQUE (empresa_id, rol_id, menu_id)
);

-- 3. Asignación usuario → rol (nivel sucursal, para multi-sucursal)
--    Un usuario puede tener distintos roles según la sucursal.
CREATE TABLE seguridad.sg_usuario_rol (
    id          SERIAL PRIMARY KEY,
    empresa_id  INTEGER     NOT NULL,
    secuencia   INTEGER,
    username    VARCHAR(20) NOT NULL REFERENCES seguridad.sg_usuario(username),
    rol_id      INTEGER     NOT NULL REFERENCES seguridad.sg_rol(id),
    sucursal_id INTEGER     NOT NULL REFERENCES seguridad.sg_sucursal(id),
    activo      BOOLEAN     NOT NULL DEFAULT TRUE,
    fecha_reg   TIMESTAMP   NOT NULL DEFAULT NOW(),
    usuario_reg VARCHAR(50) NOT NULL,
    CONSTRAINT uq_sg_usuario_rol UNIQUE (empresa_id, sucursal_id, username, rol_id)
);

-- Menú "Roles" en el módulo SEG
INSERT INTO seguridad.sg_menu (activo, empresa_id, orden, secuencia, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
VALUES (TRUE, 1, 0, 10, 'SEG', NOW(), 'Roles', 'A', '/roles', NULL, 'Master');

-- Índices de soporte
CREATE INDEX idx_sg_permiso_rol    ON seguridad.sg_permiso(rol_id);
CREATE INDEX idx_sg_permiso_menu   ON seguridad.sg_permiso(menu_id);
CREATE INDEX idx_sg_usuario_rol_u  ON seguridad.sg_usuario_rol(username);
CREATE INDEX idx_sg_usuario_rol_r  ON seguridad.sg_usuario_rol(rol_id);
CREATE INDEX idx_sg_usuario_rol_s  ON seguridad.sg_usuario_rol(sucursal_id);
