-- ============================================================
-- Precios de Envío — Registro de menú y permisos
-- Ejecutar después de: create_precio_envio.sql
-- ============================================================

INSERT INTO seguridad.sg_menu
    (activo, empresa_id, orden, modulo_id, fecha_reg, menu, tipo_menu_id, url, url_sql, usuario_reg)
SELECT
    TRUE, e.id, 8, 'DE', NOW(), 'Precios de Envío', 'P', '/despacho/precios-envio', NULL, 'Master'
FROM seguridad.sg_empresa e
WHERE e.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.sg_menu m
      WHERE m.url = '/despacho/precios-envio' AND m.empresa_id = e.id
  );


-- Permiso lectura a todos los roles activos
INSERT INTO seguridad.sg_permiso
    (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, activo, fecha_reg, usuario_reg)
SELECT
    r.empresa_id, r.id, m.id,
    TRUE, FALSE, FALSE, FALSE, TRUE, NOW(), 'Master'
FROM seguridad.sg_rol  r
JOIN seguridad.sg_menu m ON m.empresa_id = r.empresa_id AND m.url = '/despacho/precios-envio'
WHERE r.activo = TRUE
ON CONFLICT (empresa_id, rol_id, menu_id) DO NOTHING;


-- Permiso escritura al rol ADMINISTRADOR (ajustar ids)
DO $$
DECLARE
    v_empresa_id  INTEGER := 1;   -- ← AJUSTAR
    v_rol_admin   INTEGER := 1;   -- ← AJUSTAR
BEGIN
    UPDATE seguridad.sg_permiso p
    SET    puede_escribir = TRUE,
           puede_eliminar = TRUE
    FROM   seguridad.sg_menu m
    WHERE  m.id         = p.menu_id
      AND  p.rol_id     = v_rol_admin
      AND  p.empresa_id = v_empresa_id
      AND  m.url        = '/despacho/precios-envio';

    RAISE NOTICE 'Permisos escritura/eliminar asignados al rol admin (id=%) empresa (id=%).',
        v_rol_admin, v_empresa_id;
END $$;


-- Verificación:
-- SELECT id, empresa_id, modulo_id, menu, url, orden FROM seguridad.sg_menu
-- WHERE url = '/despacho/precios-envio' ORDER BY empresa_id;
