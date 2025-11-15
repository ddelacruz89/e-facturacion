export interface TipoFactura {
    id?: number; // opcional si lo generas automáticamente
    secuencia?: number; // opcional si lo generas automáticamente
    nombre: string;
    activo: boolean;
}

export interface TipoComprobante {
    id?: string; // opcional si lo generas automáticamente
    tipoComprobante: string;
    electronico: boolean;
}

export interface MgItbis {
    id?: number;
    nombre: string;
    itbis: number;
    activo: boolean;
}

// Simple DTO for itbis resumen endpoint
export interface MgItbisSimpleDTO {
    id: number;
    nombre: string;
}

export interface MfSucursalItbis {
    // From BaseEntityPk
    id?: number;
    empresaId: number;
    secuencia?: number;
    // From BaseEntitySucursal
    usuarioReg: string;
    fechaReg: Date;
    sucursalId: number;
    activo: boolean;
    // Own properties
    nombre: string;
    itbis: number;
    mgItbisId: number; // Foreign key reference to MgItbis
}

export interface Factura {
    usuarioReg?: string;
    fechaReg?: Date;
    activo: boolean;
    empresaId: number;
    trackId?: string;
    qrUrl?: string;
    aprobada?: boolean;
    razonSocial?: string;
    rnc?: string;
    tipoComprobanteId: string;
    ncf?: string;
    id?: number;
    numeroFactura?: number;
    tipoFacturaId: number;
    clienteId?: number;
    monto: number;
    descuento: number;
    itbis: number;
    retencionItbis?: number;
    retencionIsr?: number;
    total: number;
    detalles: FacturaDetalle[];
}

export interface FacturaDetalle {
    id: number;
    facturaId: number;
    linea: number;
    productoId: number;
    precioCosto: number;
    precioVentaUnd: number;
    precioVenta: number;
    montoDescueto: number;
    cantidad: number;
    montoVenta: number;
    itbisId: number;
    montoItbis: number;
    retencionItbis: number;
    retencionIsr: number;
    almacenId: number;
}
