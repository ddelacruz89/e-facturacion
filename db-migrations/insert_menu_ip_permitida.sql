-- ============================================================
-- IPs de Login Permitidas — Menú y permisos
-- Módulo SEG, disponible en todas las empresas activas
-- ============================================================

-- Diagnóstico previo:
-- SELECT id, empresa_id, modulo_id, menu, url, orden
-- FROM seguridad.sg_menu WHERE modulo_id = 'SEG' ORDER BY empresa_id, orden;

-- ── MENÚ: todas las empresas activas ─────────────────────────────────────────

INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 5, 'SEG', NOW(), 'IPs Permitidas', 'A', '/seguridad/ip-permitida', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/seguridad/ip-permitida' AND m.empresa_id = e.id
  );


-- ── PERMISOS: lectura para todos los roles activos ────────────────────────────

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
                         AND m.url = '/seguridad/ip-permitida'
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;


-- ── ESCRITURA Y ELIMINACIÓN: solo al rol ADMINISTRADOR de cada empresa ────────
-- Ver roles: SELECT id, empresa_id, nombre FROM seguridad.sg_rol WHERE activo = TRUE ORDER BY empresa_id;

DO $$
DECLARE
    v_empresa_id  INTEGER := 1;   -- ← AJUSTAR: id de la empresa
    v_rol_admin   INTEGER := 1;   -- ← AJUSTAR: id del rol Administrador en esa empresa
BEGIN
    UPDATE seguridad.sg_permiso p
    SET    puede_escribir = TRUE,
           puede_eliminar = TRUE
    FROM   seguridad.sg_menu m
    WHERE  m.id         = p.menu_id
      AND  p.rol_id     = v_rol_admin
      AND  p.empresa_id = v_empresa_id
      AND  m.url        = '/seguridad/ip-permitida';

    RAISE NOTICE 'Permisos de escritura asignados — empresa_id=% rol_id=%', v_empresa_id, v_rol_admin;
END $$;


-- ── VERIFICACIÓN ──────────────────────────────────────────────────────────────
-- SELECT p.empresa_id, r.nombre AS rol, m.url,
--        p.puede_leer, p.puede_escribir, p.puede_eliminar
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_rol  r ON r.id = p.rol_id
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.url = '/seguridad/ip-permitida'
-- ORDER BY p.empresa_id, p.rol_id;
