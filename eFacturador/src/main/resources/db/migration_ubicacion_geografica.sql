-- =====================================================================
-- Migración: tablas geográficas + campos en mg_cliente
-- =====================================================================

-- 1. Provincia (catalog global, sin tenant)
CREATE TABLE IF NOT EXISTS general.mg_provincia (
  cod_provincia VARCHAR(2)  NOT NULL,
  descripcion   VARCHAR(30),
  oficio        BIGINT,
  estatus       VARCHAR(1),
  zona          VARCHAR(2),
  PRIMARY KEY (cod_provincia)
);

CREATE INDEX IF NOT EXISTS mg_provincia_idx ON general.mg_provincia (cod_provincia);

-- 2. Municipio (catalog global, sin tenant)
CREATE TABLE IF NOT EXISTS general.mg_municipio (
  cod_municipio        VARCHAR(3)  NOT NULL,
  descripcion          VARCHAR(35),
  cod_provincia        VARCHAR(2)  NOT NULL,
  cod_municipio_padre  VARCHAR(3),
  oficio               BIGINT,
  estatus              VARCHAR(1),
  dm                   VARCHAR(1),
  PRIMARY KEY (cod_municipio),
  FOREIGN KEY (cod_provincia)       REFERENCES general.mg_provincia (cod_provincia),
  FOREIGN KEY (cod_municipio_padre) REFERENCES general.mg_municipio (cod_municipio)
);

CREATE INDEX IF NOT EXISTS mg_municipio_provincia_idx ON general.mg_municipio (cod_provincia);
CREATE INDEX IF NOT EXISTS mg_municipio_padre_idx     ON general.mg_municipio (cod_municipio_padre);

-- 3. Sector / Paraje (catalog global, sin tenant)
CREATE TABLE IF NOT EXISTS general.mg_sector_paraje (
  id            SERIAL      NOT NULL,
  cod_municipio VARCHAR(3)  NOT NULL,
  descripcion   VARCHAR(70),
  cod_ciudad    VARCHAR(2)  NOT NULL,
  oficio        BIGINT,
  estatus       VARCHAR(1),
  PRIMARY KEY (id),
  FOREIGN KEY (cod_municipio) REFERENCES general.mg_municipio (cod_municipio)
);

CREATE INDEX IF NOT EXISTS mg_sector_paraje_municipio_idx ON general.mg_sector_paraje (cod_municipio);

-- 4. Campos de ubicación en mg_cliente
ALTER TABLE general.mg_cliente
  ADD COLUMN IF NOT EXISTS cod_provincia          VARCHAR(2),
  ADD COLUMN IF NOT EXISTS cod_municipio_cabecera VARCHAR(3),
  ADD COLUMN IF NOT EXISTS cod_municipio          VARCHAR(3),
  ADD COLUMN IF NOT EXISTS sector_paraje_id       INTEGER;
