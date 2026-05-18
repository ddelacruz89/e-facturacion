-- ============================================================
-- Menús faltantes en sg_menu
-- Estos menús estaban definidos solo en el frontend (HomeView.tsx)
-- y necesitan existir en la BD para que aparezcan en la matriz de permisos.
-- ============================================================

-- MÓDULO: INV (Inventario)
INSERT INTO seguridad.sg_menu (activo, empresa_id, orden, secuencia, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
VALUES
    (TRUE, 1, 1,  11, 'INV', NOW(), 'Suplidores',            'A', '/suplidores',       NULL, 'Master'),
    -- Cotizaciones: verificar si ya existe antes de insertar
    -- (TRUE, 1, 2,  12, 'INV', NOW(), 'Cotizaciones',           'A', '/cotizacion',       NULL, 'Master'),
    (TRUE, 1, 3,  13, 'INV', NOW(), 'Órdenes de Compra',     'A', '/orden-compra',     NULL, 'Master'),
    (TRUE, 1, 4,  14, 'INV', NOW(), 'Órdenes de Entrada',    'A', '/orden-entrada',    NULL, 'Master'),
    (TRUE, 1, 5,  15, 'INV', NOW(), 'Transferencias',        'A', '/transferencias',   NULL, 'Master'),
    (TRUE, 1, 6,  16, 'INV', NOW(), 'Lotes',                 'A', '/lotes',            NULL, 'Master'),
    (TRUE, 1, 7,  17, 'INV', NOW(), 'Movimientos',           'A', '/movimientos',      NULL, 'Master'),
    (TRUE, 1, 8,  18, 'INV', NOW(), 'Ajuste de Inventario',  'A', '/ajuste-inventario',NULL, 'Master'),
    (TRUE, 1, 9,  19, 'INV', NOW(), 'Almacenes',             'A', '/almacenes',        NULL, 'Master'),
    (TRUE, 1, 10, 20, 'INV', NOW(), 'Stock por Almacén/Lote','A', '/stock-arbol',      NULL, 'Master');

-- MÓDULO: FA (Facturación)
INSERT INTO seguridad.sg_menu (activo, empresa_id, orden, secuencia, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
VALUES
    (TRUE, 1, 7, 31, 'FA', NOW(), 'Facturas Suplidor', 'A', '/factura-suplidor', NULL, 'Master');

-- MÓDULO: TAR (Tarifario) — Unidades, si no existe ya
INSERT INTO seguridad.sg_menu (activo, empresa_id, orden, secuencia, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
VALUES
    (TRUE, 1, 3, 32, 'TAR', NOW(), 'Unidades', 'A', '/unidad', NULL, 'Master');
