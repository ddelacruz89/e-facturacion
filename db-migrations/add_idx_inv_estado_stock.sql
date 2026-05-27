-- Índice para consultas de stock crítico y filtros de salud de inventario.
-- Permite buscar eficientemente todos los registros BAJO/SALUDABLE por empresa.

CREATE INDEX IF NOT EXISTS idx_inv_estado_stock
    ON inventario.in_inventarios (empresa_id, estado_producto_inventario)
    WHERE estado_producto_inventario IS NOT NULL;
