-- ============================================================
-- Precios de envío por zona — multi-tenant
-- Cada empresa configura sus propios precios por barrio/sub-barrio.
-- ============================================================

CREATE TABLE IF NOT EXISTS despacho.de_precio_envio (
    id              SERIAL PRIMARY KEY,
    empresa_id      INTEGER       NOT NULL,
    barrio_id       INTEGER       NOT NULL REFERENCES general.mg_barrio_paraje(id),
    sub_barrio_id   INTEGER       REFERENCES general.mg_sub_barrio(id),
    precio          DECIMAL(10,2) NOT NULL,
    fecha_reg       TIMESTAMP     NOT NULL DEFAULT NOW(),
    usuario_reg     VARCHAR(100)  NOT NULL
);

-- Precio para todo el barrio (sub_barrio_id IS NULL) — uno por empresa
CREATE UNIQUE INDEX IF NOT EXISTS de_precio_envio_barrio_uq
    ON despacho.de_precio_envio (empresa_id, barrio_id)
    WHERE sub_barrio_id IS NULL;

-- Precio específico por sub-barrio — uno por empresa
CREATE UNIQUE INDEX IF NOT EXISTS de_precio_envio_sub_barrio_uq
    ON despacho.de_precio_envio (empresa_id, sub_barrio_id)
    WHERE sub_barrio_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS de_precio_envio_empresa_barrio_idx
    ON despacho.de_precio_envio (empresa_id, barrio_id);
