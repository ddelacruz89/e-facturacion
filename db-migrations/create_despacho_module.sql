-- Módulo de Despacho y Entrega
-- Flujo orden: PEN → EN_RUTA → EN_CAMINO → ENTREGADO | DEVUELTO | ANU
-- Flujo ruta:  PLANIFICADA → EN_CURSO → COMPLETADA | ANU

CREATE SCHEMA IF NOT EXISTS despacho;

-- Catálogo de vehículos por empresa
CREATE TABLE despacho.de_vehiculo (
    id           SERIAL PRIMARY KEY,
    empresa_id   INTEGER      NOT NULL,
    secuencia    INTEGER,
    tipo         VARCHAR(30)  NOT NULL DEFAULT 'CAMIONETA',  -- CAMION, CAMIONETA, MOTO, AUTO, OTRO
    descripcion  VARCHAR(200) NOT NULL,
    placa        VARCHAR(20),
    activo       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Ruta de entrega: agrupa órdenes para un conductor + vehículo + día
CREATE TABLE despacho.de_ruta_entrega (
    id                   SERIAL PRIMARY KEY,
    secuencia            INTEGER,
    empresa_id           INTEGER      NOT NULL,
    sucursal_id          INTEGER      NOT NULL REFERENCES seguridad.sg_sucursales(id),
    fecha                DATE         NOT NULL,
    vehiculo_id          INTEGER      NOT NULL REFERENCES despacho.de_vehiculo(id),
    conductor_username   VARCHAR(100) NOT NULL,
    estado_id            VARCHAR(20)  NOT NULL DEFAULT 'PLANIFICADA',  -- PLANIFICADA, EN_CURSO, COMPLETADA, ANU
    notas                TEXT,
    usuario_reg          VARCHAR(100) NOT NULL,
    fecha_reg            TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Orden de despacho: 1 por factura activa (UNIQUE factura_id + empresa_id)
CREATE TABLE despacho.de_orden_despacho (
    id                  SERIAL PRIMARY KEY,
    secuencia           INTEGER,
    empresa_id          INTEGER      NOT NULL,
    sucursal_id         INTEGER      NOT NULL REFERENCES seguridad.sg_sucursales(id),
    factura_id          INTEGER      NOT NULL,
    factura_secuencia   INTEGER,
    cliente_id          INTEGER,
    cliente_nombre      VARCHAR(300),
    cliente_telefono    VARCHAR(30),
    direccion_entrega   TEXT,
    fecha_compromiso    TIMESTAMP    NOT NULL,
    ruta_id             INTEGER      REFERENCES despacho.de_ruta_entrega(id),
    estado_id           VARCHAR(20)  NOT NULL DEFAULT 'PEN',  -- PEN, EN_RUTA, EN_CAMINO, ENTREGADO, DEVUELTO, ANU
    notas               TEXT,
    fecha_entrega       TIMESTAMP,
    usuario_entrego     VARCHAR(100),
    usuario_reg         VARCHAR(100) NOT NULL,
    fecha_reg           TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_despacho_factura UNIQUE (factura_id, empresa_id)
);

-- Índices de consulta frecuente
CREATE INDEX idx_orden_despacho_empresa_estado ON despacho.de_orden_despacho(empresa_id, estado_id);
CREATE INDEX idx_orden_despacho_ruta ON despacho.de_orden_despacho(ruta_id);
CREATE INDEX idx_ruta_entrega_conductor_fecha ON despacho.de_ruta_entrega(conductor_username, fecha);
CREATE INDEX idx_vehiculo_empresa ON despacho.de_vehiculo(empresa_id);

-- Secuencias iniciales (descomentar e insertar por empresa_id)
-- INSERT INTO general.mg_secuencias (empresa_id, aplicacion_id, numero)
-- VALUES (1, 'DEORDENDESPACHO', 0), (1, 'DERUTAENTREGA', 0)
-- ON CONFLICT DO NOTHING;
