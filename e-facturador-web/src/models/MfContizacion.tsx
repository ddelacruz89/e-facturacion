import { ProductoVenta } from "./producto/productoVenta";

export interface Cotizacion {
    usuarioReg?: string;
    fechaReg?: Date;
    activo: boolean;
    empresaId: number;
    razonSocial?: string;
    secuencia?: number;
    rnc?: string;
    tipoComprobanteId: string;
    nota?: string;
    id?: number;
    clienteId?: number;
    monto: number;
    descuento: number;
    itbis: number;
    retencionId: number;
    retencionItbis?: number;
    retencionIsr?: number;
    total: number;
    detalles: CotizacionDetalle[];
}

export interface CotizacionDetalle {
    id?: number;
    cotizacionId?: number;
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
}

export interface ICotizacionResumen {
    id: number;
    secuencia: number;
    razonSocial: string;
    fechaReg: string;
    rnc: string;
    total: number;
}
