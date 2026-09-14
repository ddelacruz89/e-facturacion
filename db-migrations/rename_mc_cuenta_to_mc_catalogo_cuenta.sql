-- ============================================================
-- Módulo Contabilidad — Rename mc_cuenta → mc_catalogo_cuenta
-- ============================================================
-- La entidad McCuenta (y su tabla contabilidad.mc_cuenta) se renombró a
-- McCatalogoCuenta / contabilidad.mc_catalogo_cuenta, para alinear el nombre
-- de tabla con el resto del módulo (mc_tipo_cuenta, etc.) y con las FKs que
-- ya lo referencian como "catálogo de cuentas" en comentarios y documentación.
--
-- IMPORTANTE — orden de ejecución:
--   1. Ejecutar este script AHORA, contra la base de datos actual, ANTES de
--      desplegar el código nuevo. Preserva los datos, PK, FKs, índices y el
--      constraint único (empresa_id, cuenta) tal cual — un RENAME no los toca.
--   2. Luego desplegar/reiniciar la app con las entidades ya renombradas.
--      Si se hace al revés, Hibernate (ddl-auto=update) va a crear una
--      mc_catalogo_cuenta vacía nueva en vez de reutilizar la que ya tiene
--      los 251 registros importados.
--
-- Este script solo aplica si contabilidad.mc_cuenta ya existe (es decir, si
-- ya corriste create_contabilidad_catalogo_cuentas.sql e
-- insert_contabilidad_cuentas_empresa1.sql anteriormente). En un ambiente
-- nuevo donde nunca existió mc_cuenta, Hibernate crea mc_catalogo_cuenta
-- directamente con el nombre correcto — no hace falta correr este script.

ALTER TABLE IF EXISTS contabilidad.mc_cuenta RENAME TO mc_catalogo_cuenta;

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────────
-- SELECT count(*) FROM contabilidad.mc_catalogo_cuenta;
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'contabilidad' AND table_name LIKE 'mc_%';
