-- Script para cambiar el tipo de dato de la columna id en mg_categoria de VARCHAR a INTEGER
-- Hibernate NO puede hacer este cambio automáticamente con ddl-auto=update
-- Debes ejecutar este script manualmente en PostgreSQL (psql o pgAdmin)

-- OPCIÓN A: Si la tabla está VACÍA o puedes eliminar los datos
BEGIN;

ALTER TABLE producto.mg_categoria DROP COLUMN id CASCADE;
ALTER TABLE producto.mg_categoria ADD COLUMN id SERIAL PRIMARY KEY;

COMMIT;


-- OPCIÓN B: Si tienes DATOS que necesitas conservar
-- Descomentar las siguientes líneas y comentar la OPCIÓN A:

/*
BEGIN;

-- 1. Crear columna temporal INTEGER
ALTER TABLE producto.mg_categoria ADD COLUMN id_new INTEGER;

-- 2. Crear secuencia
CREATE SEQUENCE IF NOT EXISTS producto.mg_categoria_id_seq;

-- 3. Asignar nuevos IDs secuenciales
UPDATE producto.mg_categoria
SET id_new = nextval('producto.mg_categoria_id_seq');

-- 4. Eliminar columna antigua
ALTER TABLE producto.mg_categoria DROP COLUMN id CASCADE;

-- 5. Renombrar columna nueva
ALTER TABLE producto.mg_categoria RENAME COLUMN id_new TO id;

-- 6. Configurar como PRIMARY KEY
ALTER TABLE producto.mg_categoria ALTER COLUMN id SET NOT NULL;
ALTER TABLE producto.mg_categoria ADD PRIMARY KEY (id);
ALTER TABLE producto.mg_categoria ALTER COLUMN id SET DEFAULT nextval('producto.mg_categoria_id_seq');
ALTER SEQUENCE producto.mg_categoria_id_seq OWNED BY producto.mg_categoria.id;

COMMIT;
*/

-- Verificar el cambio
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'producto'
AND table_name = 'mg_categoria'
AND column_name = 'id';

