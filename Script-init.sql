INSERT INTO seguridad.sg_empresa
(
    activo,
    fecha_reg,
    correo,
    direccion,
    empresa,
    razon_social,
    rnc,
    telefono,
    usuario_reg,
    logo
)
VALUES
(
    TRUE,
    NOW(),
    'info@demo.com',
    'Av. Central #100',
    'DemoCorp',
    'Demo Corporation S.R.L.',
    '123456789',
    '+1 809-555-0000',
    'admin',
    NULL
);

INSERT INTO seguridad.sg_sucursal
(
    activo,
    empresa_id,
    fecha_reg,
    direccion,
    email,
    encargado,
    estado_id,
    nombre,
    usuario_reg
)
VALUES
(
    TRUE,
    1,
    NOW(),
    'Av. Independencia #200',
    'sucursal1@miempresa.com',
    'Juan Pérez',
    1,
    'Sucursal Principal',
    'admin'
);

INSERT INTO seguridad.sg_tipo_menu
(activo, fecha_reg, id, tipo, usuario_reg)
VALUES
(true, NOW(), 'A', 'Aplicacion', 'Master'),
(true, NOW(), 'P', 'Parametro', 'Master'),
(true, NOW(), 'R', 'Reporte', 'Master');

INSERT INTO seguridad.sg_modulo
(activo, id, fecha_reg, modulo, usuario_reg)
values
(true, 'FA', NOW(), 'Facturacion', 'Master'),
(true, 'SEG', NOW(), 'Seguridad', 'Master'),
(true, 'INV', NOW(), 'Inventario', 'Master'),
(true, 'CONT', NOW(), 'Contabilidad', 'Master'),
(true, 'TAR', NOW(), 'Tarifario', 'Master');

INSERT INTO seguridad.sg_menu
(
    activo,
    empresa_id,
    orden,
    secuencia,
    modulo_id,
    fecha_reg,
    menu,
    tipo_menu_id,
    url,
    url_sql,
    usuario_reg
)
VALUES
(TRUE, 1, 0, 1, 'SEG', NOW(), 'Empresa', 'A', '/empresa', NULL, 'Master'),
(TRUE, 1, 0, 2, 'SEG', NOW(), 'Usuario', 'A', '/usuario', NULL, 'Master'),
(TRUE, 1, 0, 3, 'FA', NOW(), 'Tipo Factura', 'A', '/tipo/factura', NULL, 'Master'),
(TRUE, 1, 0, 4, 'FA', NOW(), 'Tipo ITBIS', 'A', '/tipo/itbis', NULL, 'Master'),
(TRUE, 1, 0, 5, 'FA', NOW(), 'Tipo Comprobante', 'A', '/tipo/comprobante', NULL, 'Master'),
(TRUE, 1, 0, 6, 'FA', NOW(), 'Facturación', 'A', '/facturacion', NULL, 'Master'),
(TRUE, 1, 0, 7, 'TAR', NOW(), 'Producto', 'A', '/producto', NULL, 'Master'),
(TRUE, 1, 0, 8, 'TAR', NOW(), 'Categoría', 'A', '/categoria', NULL, 'Master')


INSERT INTO seguridad.sg_usuario
(cambio_password, empresa_id, sucursal_id, fecha_reg, username, login_email, nombre, estado_id, "password", usuario_reg)
VALUES(false, 1, 1, NOW(), 'sig.donny@gmail.com', 'sig.donny@gmail.com', 'Donny De la Cruz', 'ACT', '$2a$10$VwNyL0hNASRHcbSdZwVqgOnESKBoZP3iVZF2oIOsu/KP0guurVxGa', 'Master');





