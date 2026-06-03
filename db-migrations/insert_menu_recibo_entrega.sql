-- ============================================================
-- Recibo de Entrega — Registro de menú y permisos
-- Ejecutar después de: create_feature_plan.sql
-- ============================================================

-- ── DIAGNÓSTICO (ejecutar primero para verificar estado actual) ───────────────

-- Ver si el menú ya existe:
-- SELECT id, empresa_id, modulo_id, menu, url FROM seguridad.sg_menu
-- WHERE url IN ('/despacho/config/recibo', '/admin/feature-plan')
-- ORDER BY empresa_id;

-- Ver empresas activas:
-- SELECT id, empresa FROM seguridad.sg_empresa WHERE activo = TRUE;

-- Ver roles por empresa:
-- SELECT id, empresa_id, nombre FROM seguridad.sg_rol WHERE activo = TRUE ORDER BY empresa_id, id;


-- ── MENÚ 1: Configuración Recibo de Entrega (todas las empresas) ──────────────
-- Visible para cualquier empresa que tenga el feature habilitado en su plan.
-- Orden 6 dentro del módulo DE (después de Mis Entregas que es orden 4 y Tipo Vehículo orden 5).

INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 6, 'DE', NOW(), 'Config. Recibo', 'P', '/despacho/config/recibo', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/despacho/config/recibo' AND m.empresa_id = e.id
  );


-- ── MENÚ 2: Administración Feature Plan (solo empresa_id = 1 — operador SaaS) ──
-- Permite al equipo SaaS habilitar/deshabilitar features por empresa cliente.

INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 7, 'DE', NOW(), 'Admin Features', 'P', '/admin/feature-plan', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.id = 1           -- Solo la empresa operadora del SaaS
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/admin/feature-plan' AND m.empresa_id = e.id
  );


-- ── PERMISOS: lectura base para todos los roles activos ──────────────────────

INSERT INTO seguridad.sg_permiso
    (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, activo, fecha_reg, usuario_reg)
SELECT
    r.empresa_id,
    r.id        AS rol_id,
    m.id        AS menu_id,
    TRUE        AS puede_leer,
    FALSE       AS puede_escribir,
    FALSE       AS puede_eliminar,
    FALSE       AS puede_imprimir,
    TRUE,
    NOW(),
    'Master'
FROM seguridad.sg_rol  r
JOIN seguridad.sg_menu m ON m.empresa_id = r.empresa_id
                         AND m.url IN ('/despacho/config/recibo', '/admin/feature-plan')
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;


-- ── PERMISOS DE ESCRITURA: solo al rol ADMINISTRADOR de cada empresa ──────────
-- Ajusta los ids de empresa y rol según tu BD.
-- Para ver roles: SELECT id, empresa_id, nombre FROM seguridad.sg_rol WHERE activo = TRUE;

DO $$
DECLARE
    v_empresa_id  INTEGER := 1;   -- ← AJUSTAR: empresa a configurar (repetir bloque por empresa)
    v_rol_admin   INTEGER := 1;   -- ← AJUSTAR: id del rol Administrador en esa empresa
BEGIN
    UPDATE seguridad.sg_permiso p
    SET    puede_escribir = TRUE,
           puede_eliminar = FALSE     -- Config: no necesita eliminar
    FROM   seguridad.sg_menu m
    WHERE  m.id         = p.menu_id
      AND  p.rol_id     = v_rol_admin
      AND  p.empresa_id = v_empresa_id
      AND  m.url IN ('/despacho/config/recibo', '/admin/feature-plan');

    RAISE NOTICE 'Permisos de escritura asignados al rol admin (id=%) empresa (id=%).',
        v_rol_admin, v_empresa_id;
END $$;


-- ── VERIFICACIÓN FINAL ────────────────────────────────────────────────────────

-- Menús insertados:
-- SELECT id, empresa_id, modulo_id, menu, url, tipo_menu_id, orden, activo
-- FROM seguridad.sg_menu
-- WHERE url IN ('/despacho/config/recibo', '/admin/feature-plan')
-- ORDER BY empresa_id, orden;

-- Permisos creados:
-- SELECT p.empresa_id, p.rol_id, r.nombre AS rol, m.url,
--        p.puede_leer, p.puede_escribir, p.puede_eliminar
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_rol  r ON r.id = p.rol_id
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.url IN ('/despacho/config/recibo', '/admin/feature-plan')
-- ORDER BY p.empresa_id, p.rol_id;
