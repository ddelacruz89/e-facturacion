-- =============================================================================
-- Factura Suplidor (cabecera + detalle)
-- Schema: facturacion
-- =============================================================================

CREATE TABLE IF NOT EXISTS facturacion.mf_factura_suplidor (
    id                            SERIAL PRIMARY KEY,
    empresa_id                    INTEGER       NOT NULL,
    sucursal_id                   INTEGER       NOT NULL,
    secuencia                     INTEGER,

    -- DgII / NCF
    ncf                           VARCHAR(15),
    tipo_cf_id                    VARCHAR(2),
    secuity_code                  VARCHAR(7),
    track_id                      VARCHAR(100),
    qr_url                        VARCHAR(500),
    fecha_firma                   VARCHAR(45),
    aprobada                      BOOLEAN,
    razon_social                  VARCHAR(200),
    rnc                           VARCHAR(20),

    -- Identificación de la factura
    numero_factura                VARCHAR(20),
    tipo_ingreso                  INTEGER,
    fecha_emision                 DATE,
    fecha_limite_pago             DATE,
    fecha_vencimiento             DATE,
    fecha_pago                    TIMESTAMP,
    factura_fecha_manual          TIMESTAMP,
    fecha_creacion                TIMESTAMP     NOT NULL DEFAULT NOW(),
    estado_id                     VARCHAR(3),

    -- Suplidor
    suplidor_id                   INTEGER,
    orden_entrada_id              INTEGER,

    -- Tipo
    tipo_pago                     INTEGER,
    concepto                      VARCHAR(200),
    tipo_factura_id               INTEGER       NOT NULL,
    es_facturado_electronicamente BOOLEAN       DEFAULT FALSE,
    es_credito                    BOOLEAN,

    -- Montos
    subtotal                      NUMERIC(18,2),
    itbis                         NUMERIC(18,2),
    descuento                     NUMERIC(18,2) DEFAULT 0,
    total                         NUMERIC(18,2),
    pago                          NUMERIC(18,2),
    monto_anulado                 NUMERIC(18,2) DEFAULT 0,
    monto_retencion_itbis         NUMERIC(18,2),

    -- Retenciones
    retenciones_itbis_id          INTEGER,
    retencion_itbis               NUMERIC(18,2) DEFAULT 0,
    retencion_isr_id              INTEGER,
    retencion_isr                 NUMERIC(18,2),

    -- Contabilidad
    contable_id                   INTEGER,
    cxp_id                        INTEGER,

    -- Mora
    tiene_mora                    BOOLEAN,
    mora_porciento                INTEGER,
    fecha_mora                    TIMESTAMP,

    -- Anulación
    fecha_anulado                 TIMESTAMP,
    usuario_anulacion             VARCHAR(25),

    -- Auditoría
    usuario_reg                   VARCHAR(20),
    fecha_reg                     TIMESTAMP     NOT NULL DEFAULT NOW(),
    activo                        BOOLEAN       DEFAULT TRUE,

    -- FKs
    CONSTRAINT fk_fs_suplidor          FOREIGN KEY (suplidor_id)          REFERENCES inventario.in_suplidor(id),
    CONSTRAINT fk_fs_tipo_factura      FOREIGN KEY (tipo_factura_id)       REFERENCES facturacion.mg_tipo_factura(id),
    CONSTRAINT fk_fs_retencion_itbis   FOREIGN KEY (retenciones_itbis_id)  REFERENCES general.mg_retenciones_itbis(id),
    CONSTRAINT fk_fs_retencion_isr     FOREIGN KEY (retencion_isr_id)      REFERENCES general.mg_retenciones_itbis(id),
    CONSTRAINT fk_fs_contable          FOREIGN KEY (contable_id)           REFERENCES contabilidad.mc_catalago_cuenta(id),
    CONSTRAINT fk_fs_cxp               FOREIGN KEY (cxp_id)                REFERENCES contabilidad.mc_catalago_cuenta(id)
);

-- Índices para búsqueda multi-tenant
CREATE INDEX IF NOT EXISTS idx_mf_fs_empresa_sucursal ON facturacion.mf_factura_suplidor (empresa_id, sucursal_id);
CREATE INDEX IF NOT EXISTS idx_mf_fs_suplidor         ON facturacion.mf_factura_suplidor (suplidor_id);
CREATE INDEX IF NOT EXISTS idx_mf_fs_estado           ON facturacion.mf_factura_suplidor (estado_id);
CREATE INDEX IF NOT EXISTS idx_mf_fs_fecha_reg        ON facturacion.mf_factura_suplidor (fecha_reg DESC);

-- =============================================================================
-- Detalle
-- =============================================================================

CREATE TABLE IF NOT EXISTS facturacion.mf_factura_suplidor_detalle (
    id                       SERIAL PRIMARY KEY,
    factura_suplidor_id      INTEGER       NOT NULL,
    cantidad                 INTEGER       NOT NULL DEFAULT 1,
    precio_unitario          NUMERIC(20,4) NOT NULL DEFAULT 0,
    monto_item               NUMERIC(18,2) NOT NULL DEFAULT 0,
    concepto                 VARCHAR(200),
    subtotal                 NUMERIC(18,2),
    retencion                NUMERIC(18,2) DEFAULT 0,
    retencion_porciento      DOUBLE PRECISION,
    monto_descuento          NUMERIC(18,2),
    monto_recargo            NUMERIC(18,2),
    itbis                    NUMERIC(18,2),
    monto_itbis_retenido     NUMERIC(18,2) DEFAULT 0,
    itbis_id                 INTEGER       NOT NULL,
    itbis_porciento          DOUBLE PRECISION,
    total                    NUMERIC(18,2),
    usuario_reg              VARCHAR(45),
    fecha_reg                TIMESTAMP     NOT NULL DEFAULT NOW(),
    indicador_bien_servicio  BOOLEAN       NOT NULL DEFAULT TRUE,
    estado                   VARCHAR(3),
    forma_pago_id            INTEGER,

    CONSTRAINT fk_fsd_cabecera FOREIGN KEY (factura_suplidor_id) REFERENCES facturacion.mf_factura_suplidor(id),
    CONSTRAINT fk_fsd_itbis    FOREIGN KEY (itbis_id)            REFERENCES general.mg_itbis(id)
);

CREATE INDEX IF NOT EXISTS idx_mf_fsd_cabecera ON facturacion.mf_factura_suplidor_detalle (factura_suplidor_id);
