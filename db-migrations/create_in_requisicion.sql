-- Módulo de Requisiciones de Transferencia
-- Una requisicion permite a un almacen solicitar productos de otro almacen.
-- Flujo: PEN → APR/REC → COM/ANU

CREATE TABLE inventario.in_requisicion (
    id               SERIAL PRIMARY KEY,
    secuencia        INTEGER,
    empresa_id       INTEGER NOT NULL,
    sucursal_id      INTEGER NOT NULL REFERENCES seguridad.sg_sucursales(id),
    almacen_solicitante_id INTEGER NOT NULL REFERENCES inventario.in_almacenes(id),
    almacen_origen_id      INTEGER NOT NULL REFERENCES inventario.in_almacenes(id),
    prioridad        VARCHAR(10)  NOT NULL DEFAULT 'MEDIA',  -- ALTA, MEDIA, BAJA
    estado_id        VARCHAR(10)  NOT NULL DEFAULT 'PEN',    -- PEN, APR, REC, COM, ANU
    observaciones    TEXT,
    fecha_requerida  DATE,
    usuario_reg      VARCHAR(100) NOT NULL,
    fecha_reg        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE inventario.in_requisicion_detalle (
    id                   SERIAL PRIMARY KEY,
    requisicion_id       INTEGER        NOT NULL REFERENCES inventario.in_requisicion(id),
    producto_id          INTEGER        NOT NULL,
    cantidad_solicitada  DECIMAL(16, 2) NOT NULL,
    cantidad_aprobada    DECIMAL(16, 2),
    observaciones        TEXT
);

-- Secuencia inicial (la función get_next_secuencia la crea automáticamente si no existe,
-- pero se puede pre-insertar aquí por empresa si se desea iniciar en 0).
-- INSERT INTO general.mg_secuencias (empresa_id, aplicacion_id, numero)
-- VALUES (1, 'INREQUISICION', 0)
-- ON CONFLICT DO NOTHING;
