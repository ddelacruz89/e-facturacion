import { ProductoVenta } from "./producto/productoVenta";

export interface TipoFactura {
    id?: number; // opcional si lo generas automáticamente
    secuencia?: number; // opcional si lo generas automáticamente
    nombre: string;
    activo: boolean;
}

export interface TipoComprobante {
    id?: string;
    tipoComprobante: string;
    electronico: boolean;
    categoria?: string;
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
    id?: number;
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    nombre: string;
    itbis: number;
    mgItbisId: number;
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
    efectivo?: number | null;         // numeric(38,2)
    notaCredito?: number | null;      // numeric(38,2)
    otros?: number | null;            // numeric(38,2)
    tarjeta?: number | null;          // numeric(38,2)
    total?: number | null;            // numeric(38,2)
    transferencia?: number | null;    // numeric(38,2)
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

