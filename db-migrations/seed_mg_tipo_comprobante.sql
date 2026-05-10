-- =============================================================================
-- Seed: tipos de comprobante fiscal (DGII República Dominicana)
-- Schema: facturacion
-- Tabla: mg_tipo_comprobante
-- Columnas: id (VARCHAR PK), serie, tipo_comprobante, electronico, activo,
--           usuario_reg, fecha_reg
-- =============================================================================

INSERT INTO facturacion.mg_tipo_comprobante
    (id, serie, tipo_comprobante, electronico, activo, usuario_reg, fecha_reg)
VALUES
    -- Serie B (comprobantes físicos / en papel)
    ('00', 'B', 'No Asignar',                                        false, true,  'Master', '2021-01-14 19:07:59'),
    ('01', 'B', 'Factura de Crédito Fiscal',                         false, false, 'Master', '2020-09-01 22:21:23'),
    ('02', 'B', 'Factura Para Consumidor Final',                      false, false, 'Master', '2020-09-01 22:21:23'),
    ('14', 'B', 'Regímenes Especiales de Tributación',               false, false, 'Master', '2020-09-01 22:21:23'),
    ('15', 'B', 'Comprobantes Gubernamentales',                       false, false, 'Master', '2020-09-01 22:21:23'),

    -- Serie E (comprobantes electrónicos e-CF)
    ('31', 'E', 'Factura de Crédito Fiscal Electrónica',             true,  true,  'Master', '2024-11-17 18:59:46'),
    ('32', 'E', 'Factura de Consumo Electrónica',                    true,  true,  'Master', '2024-12-10 16:09:49'),
    ('33', 'E', 'Nota de Débito Electrónica',                        true,  true,  'Master', '2024-12-10 16:09:49'),
    ('34', 'E', 'Nota de Crédito Electrónica',                       true,  true,  'Master', '2024-12-10 16:09:49'),
    ('41', 'E', 'Comprobante Electrónico de Compras',                true,  true,  'Master', '2024-12-10 16:09:49'),
    ('43', 'E', 'Comprobante Electrónico para Gastos Menores',       true,  true,  'Master', '2024-12-10 16:09:49'),
    ('44', 'E', 'Comprobante Electrónico para Regímenes Especiales', true,  true,  'Master', '2024-12-10 16:09:49'),
    ('45', 'E', 'Comprobante Electrónico Gubernamental',             true,  true,  'Master', '2024-12-10 16:09:49'),
    ('46', 'E', 'Comprobante Electrónico para Exportaciones',        true,  true,  'Master', '2024-12-10 16:09:49'),
    ('47', 'E', 'Comprobante Electrónico para Pagos al Exterior',    true,  true,  'Master', '2024-12-10 16:09:49')
ON CONFLICT (id) DO UPDATE
    SET serie            = EXCLUDED.serie,
        tipo_comprobante = EXCLUDED.tipo_comprobante,
        electronico      = EXCLUDED.electronico,
        activo           = EXCLUDED.activo,
        usuario_reg      = EXCLUDED.usuario_reg,
        fecha_reg        = EXCLUDED.fecha_reg;
