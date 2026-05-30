-- ============================================================
-- Módulo de Despacho — Registro de menús y permisos
-- Ejecutar después de: create_despacho_module.sql
-- ============================================================

-- ── DIAGNÓSTICO (ejecutar primero para verificar estado actual) ───────────────

-- Ver si el módulo DE ya existe:
-- SELECT * FROM seguridad.sg_modulo WHERE id = 'DE';

-- Ver empresas activas:
-- SELECT id, empresa FROM seguridad.sg_empresa WHERE activo = TRUE;

-- Ver roles existentes por empresa:
-- SELECT id, empresa_id, nombre FROM seguridad.sg_rol WHERE activo = TRUE ORDER BY empresa_id, id;

-- Ver si los menús ya fueron insertados:
-- SELECT id, empresa_id, modulo_id, menu, url FROM seguridad.sg_menu WHERE modulo_id = 'DE';

-- Ver permisos actuales del módulo:
-- SELECT p.empresa_id, p.rol_id, r.nombre AS rol, m.menu, m.url,
--        p.puede_leer, p.puede_escribir, p.puede_eliminar
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_rol  r ON r.id = p.rol_id
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.modulo_id = 'DE'
-- ORDER BY p.empresa_id, p.rol_id, m.url;


-- ── PASO 1 — Módulo Despacho ──────────────────────────────────────────────────
INSERT INTO seguridad.sg_modulo (id, modulo, activo, fecha_reg, usuario_reg)
VALUES ('DE', 'Despacho', TRUE, NOW(), 'Master')
ON CONFLICT (id) DO NOTHING;


-- ── PASO 2 — Menús para cada empresa activa ───────────────────────────────────
-- Usamos WHERE NOT EXISTS para evitar duplicados (sg_menu no tiene UNIQUE en url+empresa_id).

-- 2a. Vehículos de Despacho (catálogo de transportes)
INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 1, 'DE', NOW(), 'Vehículos', 'P', '/despacho/vehiculos', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/despacho/vehiculos' AND m.empresa_id = e.id
  );

-- 2b. Órdenes de Despacho (crear desde factura, gestionar estados)
INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 2, 'DE', NOW(), 'Órdenes de Despacho', 'A', '/despacho/ordenes', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/despacho/ordenes' AND m.empresa_id = e.id
  );

-- 2c. Rutas de Entrega (planificación: vehículo + conductor + órdenes)
INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 3, 'DE', NOW(), 'Rutas de Entrega', 'A', '/despacho/rutas', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/despacho/rutas' AND m.empresa_id = e.id
  );

-- 2d. Mis Entregas (vista del conductor: rutas del día + marcar estado)
INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 4, 'DE', NOW(), 'Mis Entregas', 'A', '/despacho/mis-entregas', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/despacho/mis-entregas' AND m.empresa_id = e.id
  );


-- ── PASO 3 — Permisos: lectura para TODOS los roles activos ──────────────────
-- Otorga puede_leer = TRUE en los 4 menús a todos los roles existentes.
-- Los permisos de escritura y eliminación se otorgan en el Paso 4 por rol.

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
JOIN seguridad.sg_menu m ON m.empresa_id = r.empresa_id AND m.modulo_id = 'DE'
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;


-- ── PASO 4 — Permisos de escritura y eliminación para el rol ADMINISTRADOR ───
-- Ajusta los valores de rol_id y empresa_id según tu BD.
-- Para ver los roles disponibles: SELECT id, empresa_id, nombre FROM seguridad.sg_rol WHERE activo = TRUE;

DO $$
DECLARE
    v_empresa_id  INTEGER := 1;   -- ← AJUSTAR si tienes múltiples empresas
    v_rol_admin   INTEGER := 1;   -- ← AJUSTAR al id del rol Administrador
    v_rol_despacho INTEGER := NULL; -- ← AJUSTAR al id del rol Supervisor Despacho (si existe)
BEGIN

    -- Dar escritura + eliminación al rol Administrador en los 3 menús de gestión
    UPDATE seguridad.sg_permiso p
    SET    puede_escribir = TRUE,
           puede_eliminar = TRUE
    FROM   seguridad.sg_menu m
    WHERE  m.id         = p.menu_id
      AND  p.rol_id     = v_rol_admin
      AND  p.empresa_id = v_empresa_id
      AND  m.url IN ('/despacho/vehiculos', '/despacho/ordenes', '/despacho/rutas');

    -- Si tienes un rol específico de despacho/supervisor, dale escritura en ordenes y rutas
    IF v_rol_despacho IS NOT NULL THEN
        UPDATE seguridad.sg_permiso p
        SET    puede_escribir = TRUE
        FROM   seguridad.sg_menu m
        WHERE  m.id         = p.menu_id
          AND  p.rol_id     = v_rol_despacho
          AND  p.empresa_id = v_empresa_id
          AND  m.url IN ('/despacho/ordenes', '/despacho/rutas');
    END IF;

    RAISE NOTICE 'Permisos de escritura/eliminación asignados al rol admin (id=%).',  v_rol_admin;
END $$;


-- ── SECUENCIAS para las entidades (una fila por empresa) ─────────────────────
-- Descomenta y ajusta empresa_id para cada empresa que tengas:

-- INSERT INTO general.mg_secuencias (empresa_id, aplicacion_id, numero)
-- VALUES
--     (1, 'DEORDENDESPACHO', 0),
--     (1, 'DERUTAENTREGA',   0)
-- ON CONFLICT (empresa_id, aplicacion_id) DO NOTHING;


-- ── VERIFICACIÓN FINAL ────────────────────────────────────────────────────────

-- Menús insertados:
-- SELECT id, empresa_id, modulo_id, menu, url, tipo_menu_id, activo
-- FROM seguridad.sg_menu WHERE modulo_id = 'DE' ORDER BY empresa_id, orden;

-- Permisos creados:
-- SELECT p.empresa_id, p.rol_id, r.nombre AS rol, m.url,
--        p.puede_leer, p.puede_escribir, p.puede_eliminar
-- FROM seguridad.sg_permiso p
-- JOIN seguridad.sg_rol  r ON r.id = p.rol_id
-- JOIN seguridad.sg_menu m ON m.id = p.menu_id
-- WHERE m.modulo_id = 'DE'
-- ORDER BY p.empresa_id, p.rol_id, m.url;
