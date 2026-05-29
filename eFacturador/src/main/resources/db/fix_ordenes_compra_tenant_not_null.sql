-- Paso 1: parcha registros existentes con empresa_id / sucursal_id NULL.
-- Ajusta los valores (1, 1) si tu empresa/sucursal tienen otro id.
UPDATE inventario.in_ordenes_compras
SET empresa_id  = 1
WHERE empresa_id IS NULL;

UPDATE inventario.in_ordenes_compras
SET sucursal_id = 1
WHERE sucursal_id IS NULL;

-- Paso 2: aplica la restricción NOT NULL a nivel de base de datos.
ALTER TABLE inventario.in_ordenes_compras
    ALTER COLUMN empresa_id  SET NOT NULL,
    ALTER COLUMN sucursal_id SET NOT NULL;
