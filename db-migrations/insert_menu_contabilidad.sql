-- ============================================================
-- Módulo de Contabilidad — Registro de menú y permisos
-- Ejecutar después de: create_contabilidad_catalogo_cuentas.sql
-- ============================================================

-- ── DIAGNÓSTICO (ejecutar primero para verificar estado actual) ───────────────

-- SELECT * FROM seguridad.sg_modulo WHERE id = 'CON';
-- SELECT id, empresa_id, modulo_id, menu, url FROM seguridad.sg_menu WHERE modulo_id = 'CON';


-- ── PASO 1 — Módulo Contabilidad ──────────────────────────────────────────────
INSERT INTO seguridad.sg_modulo (id, modulo, activo, fecha_reg, usuario_reg)
VALUES ('CON', 'Contabilidad', TRUE, NOW(), 'Master')
ON CONFLICT (id) DO NOTHING;


-- ── PASO 2 — Menú "Catálogo de Cuentas" para cada empresa activa ─────────────
INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 1, 'CON', NOW(), 'Catálogo de Cuentas', 'A', '/contabilidad/cuentas', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/contabilidad/cuentas' AND m.empresa_id = e.id
  );


-- ── PASO 3 — Permisos: lectura para TODOS los roles activos ──────────────────
INSERT INTO seguridad.sg_permiso
    (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, activo, fecha_reg, usuario_reg)
SELECT
    r.empresa_id,
    r.id                AS rol_id,
    m.id                AS menu_id,
    TRUE                AS puede_leer,
    FALSE               AS puede_escribir,
    FALSE               AS puede_eliminar,
    FALSE               AS puede_imprimir,
    TRUE,
    NOW(),
    'Master'
FROM seguridad.sg_rol  r
JOIN seguridad.sg_menu m ON m.empresa_id = r.empresa_id AND m.modulo_id = 'CON'
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;


-- ── PASO 4 — Permisos de escritura y eliminación para el rol ADMINISTRADOR ───
-- Ajusta v_empresa_id / v_rol_admin según tu BD antes de ejecutar.

DO $$
DECLARE
    v_empresa_id INTEGER := 1;   -- ← AJUSTAR si tienes múltiples empresas
    v_rol_admin  INTEGER := 1;   -- ← AJUSTAR al id del rol Administrador
BEGIN
    UPDATE seguridad.sg_permiso p
    SET    puede_escribir = TRUE,
           puede_eliminar = TRUE
    FROM   seguridad.sg_menu m
    WHERE  m.id         = p.menu_id
      AND  p.rol_id     = v_rol_admin
      AND  p.empresa_id = v_empresa_id
      AND  m.url = '/contabilidad/cuentas';

    RAISE NOTICE 'Permisos de escritura/eliminación asignados al rol admin (id=%).', v_rol_admin;
END $$;


-- ── VERIFICACIÓN FINAL ────────────────────────────────────────────────────────

-- SELECT id, empresa_id, modulo_id, menu, url, tipo_menu_id, activo
-- FROM seguridad.sg_menu WHERE modulo_id = 'CON' ORDER BY empresa_id, orden;

-- SELECT p.empresa_id, p.rol_id, r.nombre AS rol, m.url,
--        p.puede_leer, p.puede_escribir, p.puede_eliminar
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_rol  r ON r.id = p.rol_id
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.modulo_id = 'CON'
-- ORDER BY p.empresa_id, p.rol_id, m.url;
