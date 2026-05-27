-- ============================================================
-- Menú: Reportes de Inventario
-- ============================================================

-- ── DIAGNÓSTICO (ejecuta primero para ver el estado actual) ──────────────────

-- 1. Ver si el menú ya fue insertado
-- SELECT id, empresa_id, modulo_id, menu, url, activo
-- FROM seguridad.sg_menu
-- WHERE url = '/inventario/reportes';

-- 2. Ver todos los roles activos y sus empresa_id
-- SELECT id, empresa_id, nombre FROM seguridad.sg_rol WHERE activo = true;

-- 3. Ver si ya existen permisos para este menú
-- SELECT p.id, p.rol_id, p.empresa_id, p.puede_leer
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.url = '/inventario/reportes';

-- ── PASO 1 — Insertar el menú para TODAS las empresas activas ────────────────
--   Así el menú aparece en la pantalla de gestión de permisos sin importar
--   cuántas empresas existan en la BD.

INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE,
    e.id,           -- empresa_id de cada empresa activa
    11,             -- orden dentro del módulo INV
    'INV',
    NOW(),
    'Reportes de Inventario',
    'R',
    '/inventario/reportes',
    NULL,
    'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
ON CONFLICT DO NOTHING;


-- ── PASO 2 — Otorgar permiso de lectura a todos los roles activos ────────────
--   Relaciona cada rol con el menú de su misma empresa.
--   ON CONFLICT DO NOTHING: es idempotente, se puede ejecutar varias veces.

INSERT INTO seguridad.sg_permiso
    (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, activo, fecha_reg, usuario_reg)
SELECT
    r.empresa_id,
    r.id                AS rol_id,
    m.id                AS menu_id,
    TRUE                AS puede_leer,
    FALSE               AS puede_escribir,
    FALSE               AS puede_eliminar,
    TRUE                AS puede_imprimir,
    TRUE,
    NOW(),
    'Master'
FROM seguridad.sg_rol  r
JOIN seguridad.sg_menu m
    ON  m.empresa_id = r.empresa_id
    AND m.url        = '/inventario/reportes'
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;


-- ── VERIFICACIÓN final ───────────────────────────────────────────────────────

-- Menú insertado:
-- SELECT id, empresa_id, modulo_id, menu, url, tipo_menu_id, activo
-- FROM seguridad.sg_menu WHERE url = '/inventario/reportes';

-- Permisos creados (rol → menú):
-- SELECT p.empresa_id, p.rol_id, r.nombre AS rol, p.menu_id, p.puede_leer
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_rol  r ON r.id = p.rol_id
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.url = '/inventario/reportes';
