-- ============================================================
-- Tipo de Vehículo — catálogo por empresa
-- Ejecutar después de: create_despacho_module.sql
-- ============================================================

-- 1. Crear tabla de tipos
CREATE TABLE IF NOT EXISTS despacho.de_tipo_vehiculo (
    id          SERIAL PRIMARY KEY,
    empresa_id  INTEGER      NOT NULL,
    secuencia   INTEGER,
    nombre      VARCHAR(50)  NOT NULL,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_reg   TIMESTAMP    NOT NULL DEFAULT NOW(),
    usuario_reg VARCHAR(100) NOT NULL DEFAULT 'Master',
    CONSTRAINT uq_tipo_vehiculo UNIQUE (empresa_id, nombre)
);

-- 2. Agregar columna tipo_id a de_vehiculo (reemplaza tipo VARCHAR)
ALTER TABLE despacho.de_vehiculo
    ADD COLUMN IF NOT EXISTS tipo_id INTEGER REFERENCES despacho.de_tipo_vehiculo(id);

-- 3. Eliminar columna antigua (solo si ya no tiene datos; comentar si tienes datos existentes)
ALTER TABLE despacho.de_vehiculo
    DROP COLUMN IF EXISTS tipo;

-- 4. Hacer tipo_id NOT NULL (ejecutar DESPUÉS de migrar datos existentes)
-- ALTER TABLE despacho.de_vehiculo ALTER COLUMN tipo_id SET NOT NULL;

-- ── Datos iniciales por empresa (ajustar empresa_id) ─────────────────────────
-- Insertar tipos base para empresa 1:
INSERT INTO despacho.de_tipo_vehiculo (empresa_id, nombre, activo, usuario_reg)
VALUES
    (1, 'CAMION',    TRUE, 'Master'),
    (1, 'CAMIONETA', TRUE, 'Master'),
    (1, 'MOTO',      TRUE, 'Master'),
    (1, 'AUTO',      TRUE, 'Master'),
    (1, 'OTRO',      TRUE, 'Master')
ON CONFLICT (empresa_id, nombre) DO NOTHING;
