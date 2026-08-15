-- ============================================================
-- Módulo Contabilidad — Catálogo de Cuentas (Plan de Cuentas)
-- ============================================================
-- Hibernate (ddl-auto=update) crea las tablas contabilidad.mc_tipo_cuenta
-- y contabilidad.mc_catalogo_cuenta automáticamente al arrancar la app con las
-- nuevas entidades McTipoCuenta / McCatalogoCuenta. Ejecutar este script DESPUÉS
-- de haber levantado la app al menos una vez con el código nuevo.

-- ── PASO 1 — Eliminar las tablas stub viejas (typo, nunca tuvieron datos) ────
--   mc_catalago_cuenta (con typo en "catalago") era el nombre de tabla del
--   entity stub original, reemplazado por el módulo actual → contabilidad.mc_catalogo_cuenta
--   (sin el typo).
DROP TABLE IF EXISTS contabilidad.mc_catalago_cuenta CASCADE;

-- ── PASO 2 — Seed de contabilidad.mc_tipo_cuenta (catálogo global fijo) ──────
--   cr = TRUE  → naturaleza crédito (el saldo aumenta con crédito)
--   cr = FALSE → naturaleza débito  (el saldo aumenta con débito)
INSERT INTO contabilidad.mc_tipo_cuenta (tipo_cuenta, cr) VALUES
    ('Activo',    FALSE),
    ('Pasivo',    TRUE),
    ('Capital',   TRUE),
    ('Ingreso',   TRUE),
    ('Costo',     FALSE),
    ('Gasto',     FALSE)
ON CONFLICT DO NOTHING;

-- ── PASO 3 — Campos adicionales de mc_catalogo_cuenta (saldo importado, referencia legacy) ──
--   saldo_cuenta: saldo importado del sistema anterior (histórico, no se recalcula aquí).
--   control: código de cuenta "canónico" de referencia en la data legacy migrada,
--            solo informativo, no es FK.
ALTER TABLE contabilidad.mc_catalogo_cuenta ADD COLUMN IF NOT EXISTS saldo_cuenta NUMERIC(18, 2);
ALTER TABLE contabilidad.mc_catalogo_cuenta ADD COLUMN IF NOT EXISTS control VARCHAR(45);

--   usuario_reg / fecha_reg vienen NULL en buena parte de la data legacy migrada
--   (registros creados antes de que el sistema origen auditara esos campos).
--   El service sigue completándolos siempre en altas nuevas vía TenantContext.
ALTER TABLE contabilidad.mc_catalogo_cuenta ALTER COLUMN usuario_reg DROP NOT NULL;
ALTER TABLE contabilidad.mc_catalogo_cuenta ALTER COLUMN fecha_reg DROP NOT NULL;

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────────
-- SELECT * FROM contabilidad.mc_tipo_cuenta ORDER BY id;
