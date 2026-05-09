import { ProductoVenta } from "./producto/productoVenta";

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

export interface MgRetencion {
    id?: number;
    nombre: string;
    valor: number;
    tipoRetencion: number;
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
    secuencia?: number;
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
    retencionId: number;
    retencionItbis?: number;
    retencionIsr?: number;
    total: number;
    detalles: FacturaDetalle[];
    recibo?: Recibo;
}

export interface FacturaDetalle {
    id?: number;
    facturaId?: number;
    linea: number;
    productoId: number;
    productoDesc?: string;
    producto?: ProductoVenta;
    precioCosto: number;
    precioVentaUnd: number;
    precioVenta: number;
    precioItbis: number;
    montoDescuento: number;
    cantidad: number;
    montoVenta: number;
    itbisId: number;
    montoItbis: number;
    montoTotal?: number;
    retencionItbis: number;
    retencionIsr: number;
    almacenId: number;
}

export interface Recibo {
    id?: number;
    facturaId?: number;
    secuencia?: number;
    cheque?: number;           // numeric(38,2) -> string para evitar pérdida de precisión
    comentario?: string;
    efectivo?: number;         // numeric(38,2)
    notaCredito?: number;      // numeric(38,2)
    otros?: number;            // numeric(38,2)
    tarjeta?: number;          // numeric(38,2)
    total?: number;            // numeric(38,2)
    transferencia?: number;    // numeric(38,2)
    cambio?: number;    // numeric(38,2)
    activo?: boolean;
    fechaReg?: Date;
    usuarioReg?: string;
}

export interface IFacturaResumen {
    id: number;
    secuencia: number;
    razonSocial: string;
    ncf: string;
    fechaReg: string;
    rnc: string;
    estadoId: string;
    total: number;
}

