-- ============================================================
-- División Territorial RD 2021 (ONE) — Schema
-- ============================================================

DROP TABLE IF EXISTS general.mg_sub_barrio    CASCADE;
DROP TABLE IF EXISTS general.mg_barrio_paraje CASCADE;
DROP TABLE IF EXISTS general.mg_seccion       CASCADE;
DROP TABLE IF EXISTS general.mg_municipio     CASCADE;
DROP TABLE IF EXISTS general.mg_provincia     CASCADE;

CREATE TABLE general.mg_provincia (
    cod_provincia  CHAR(2)      NOT NULL,
    nombre         VARCHAR(80)  NOT NULL,
    cod_region     CHAR(2),
    PRIMARY KEY (cod_provincia)
);

CREATE TABLE general.mg_municipio (
    id             SERIAL        PRIMARY KEY,
    cod_one        CHAR(6)       NOT NULL UNIQUE,
    nombre         VARCHAR(120)  NOT NULL,
    cod_provincia  CHAR(2)       NOT NULL REFERENCES general.mg_provincia,
    parent_id      INTEGER       REFERENCES general.mg_municipio,
    es_dm          BOOLEAN       NOT NULL DEFAULT FALSE
);
CREATE INDEX mg_municipio_prv_idx    ON general.mg_municipio (cod_provincia);
CREATE INDEX mg_municipio_parent_idx ON general.mg_municipio (parent_id);

CREATE TABLE general.mg_seccion (
    id            SERIAL        PRIMARY KEY,
    cod_one       VARCHAR(8)    NOT NULL UNIQUE,
    nombre        VARCHAR(150)  NOT NULL,
    municipio_id  INTEGER       NOT NULL REFERENCES general.mg_municipio,
    tipo          CHAR(1)       NOT NULL DEFAULT 'R'
);
CREATE INDEX mg_seccion_mun_idx ON general.mg_seccion (municipio_id);

CREATE TABLE general.mg_barrio_paraje (
    id            SERIAL        PRIMARY KEY,
    cod_one       VARCHAR(11)   NOT NULL UNIQUE,
    nombre        VARCHAR(150)  NOT NULL,
    seccion_id    INTEGER       NOT NULL REFERENCES general.mg_seccion,
    precio_envio  DECIMAL(10,2)
);
CREATE INDEX mg_barrio_sec_idx ON general.mg_barrio_paraje (seccion_id);

CREATE TABLE general.mg_sub_barrio (
    id        SERIAL       PRIMARY KEY,
    cod_one   VARCHAR(13)  NOT NULL UNIQUE,
    cod_sub   CHAR(2)      NOT NULL,
    nombre    VARCHAR(150) NOT NULL,
    barrio_id INTEGER      NOT NULL REFERENCES general.mg_barrio_paraje
);
CREATE INDEX mg_sub_barrio_brr_idx ON general.mg_sub_barrio (barrio_id);

-- Campos en mg_cliente (se actualiza la referencia a las nuevas tablas)
ALTER TABLE general.mg_cliente
    ADD COLUMN IF NOT EXISTS cod_provincia    CHAR(2),
    ADD COLUMN IF NOT EXISTS municipio_id     INTEGER REFERENCES general.mg_municipio,
    ADD COLUMN IF NOT EXISTS barrio_id        INTEGER REFERENCES general.mg_barrio_paraje,
    ADD COLUMN IF NOT EXISTS sub_barrio_id    INTEGER REFERENCES general.mg_sub_barrio,
    ADD COLUMN IF NOT EXISTS calle            VARCHAR(200),
    ADD COLUMN IF NOT EXISTS referencia       VARCHAR(300);
