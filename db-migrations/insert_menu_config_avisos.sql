-- ============================================================
-- Config. Avisos — Registro de menú para administradores
-- URL: /seguridad/config-avisos — módulo SEG
-- ============================================================

-- Menú: visible para todas las empresas activas (módulo Seguridad)
INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 99, 'SEG', NOW(), 'Config. Avisos', 'P', '/seguridad/config-avisos', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/seguridad/config-avisos' AND m.empresa_id = e.id
  );

-- Permisos base (solo lectura) para todos los roles activos
INSERT INTO seguridad.sg_permiso
    (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, activo, fecha_reg, usuario_reg)
SELECT
    r.empresa_id, r.id, m.id,
    TRUE, FALSE, FALSE, FALSE,
    TRUE, NOW(), 'Master'
FROM seguridad.sg_rol  r
JOIN seguridad.sg_menu m ON m.empresa_id = r.empresa_id AND m.url = '/seguridad/config-avisos'
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;

-- Dar escritura al rol ADMINISTRADOR (ajustar v_rol_admin por empresa)
-- DO $$
-- DECLARE v_empresa_id INTEGER := 2; v_rol_admin INTEGER := X;
-- BEGIN
--   UPDATE seguridad.sg_permiso p
--   SET puede_escribir = TRUE
--   FROM seguridad.sg_menu m
--   WHERE m.id = p.menu_id AND p.rol_id = v_rol_admin
--     AND p.empresa_id = v_empresa_id AND m.url = '/seguridad/config-avisos';
-- END $$;

-- Verificar:
-- SELECT empresa_id, modulo_id, menu, url, orden FROM seguridad.sg_menu
-- WHERE url = '/seguridad/config-avisos' ORDER BY empresa_id;
