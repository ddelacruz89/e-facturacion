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
    retencionItbis?: number;
    retencionIsr?: number;
    total: number;
    detalles: FacturaDetalle[];
}

export interface FacturaDetalle {
    id?: number;
    facturaId?: number;
    linea: number;
    productoId: number;
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
    id: number;
    empresaId: number;
    secuencia: number | null;
    cheque: string | null;           // numeric(38,2) -> string para evitar pérdida de precisión
    comentario: string | null;
    efectivo: string | null;         // numeric(38,2)
    facturaId: number | null;
    notaCredito: string | null;      // numeric(38,2)
    otros: string | null;            // numeric(38,2)
    tarjeta: string | null;          // numeric(38,2)
    total: string | null;            // numeric(38,2)
    transferencia: string | null;    // numeric(38,2)
    activo: boolean | null;
    fechaReg: Date | null;
    usuarioReg: string | null;
}

