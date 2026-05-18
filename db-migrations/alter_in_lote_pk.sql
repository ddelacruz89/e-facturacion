-- Agrega empresa_id al PK compuesto de in_lote para soporte multi-tenant.
-- Ejecutar en ambiente de desarrollo ANTES de reiniciar el backend.

-- 1. Eliminar el PK actual
ALTER TABLE inventario.in_lote
    DROP CONSTRAINT IF EXISTS in_lote_pkey;

-- 2. Asegurar que empresa_id tenga valor en filas existentes
--    (ajusta el valor si tu empresa de prueba es diferente)
UPDATE inventario.in_lote
SET empresa_id = 1
WHERE empresa_id IS NULL;

-- 3. Hacer empresa_id NOT NULL
ALTER TABLE inventario.in_lote
    ALTER COLUMN empresa_id SET NOT NULL;

-- 4. Crear el nuevo PK compuesto con los tres campos
ALTER TABLE inventario.in_lote
    ADD CONSTRAINT in_lote_pkey PRIMARY KEY (lote, producto_id, empresa_id);
