export interface TipoFactura {
    id?: number; // opcional si lo generas automáticamente
    nombre: string;
    activo: true;
}

export interface TipoComprobante {
    id?: string; // opcional si lo generas automáticamente
    tipoComprobante: string;
    electronico: true;
}
export interface TipoItbis {
    id?: number; // opcional si lo generas automáticamente
    nombre: string;
    itbis: number;
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
