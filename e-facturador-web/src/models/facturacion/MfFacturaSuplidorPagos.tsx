export interface MfFacturaSuplidorPagosResumen {
    id: number;
    fechaPago: string;
    facturaSuplidorId: number;
    suplidorNombre: string;
    monto: number;
    pagado: number;
    usuarioReg: string;
    estadoId: string;
}

export interface MfFacturaSuplidorPagosSearchCriteria {
    facturaSuplidorId?: number;
    estadoId?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface MfFacturaSuplidorPagosDetalleRequest {
    numeroReferencia?: string;
    formaPagoId?: number;
    montoPagado: number;
    fechaPago?: string;
    concepto?: string;
    tipoPago?: number;
    estado?: string;
}

export interface MfFacturaSuplidorPagosRequest {
    facturaSuplidorId: number;
    monto: number;
    pagado: number;
    fechaPago?: string;
    estadoId?: string;
    contableId?: number;
    detalles: MfFacturaSuplidorPagosDetalleRequest[];
}

export interface MfFacturaSuplidorFormaPago {
    id: number;
    formaPago: string;
    estadoId: string;
    tipoFormaPago?: string;
}

export interface MfFacturaSuplidorPagosDetalle {
    id: number;
    numeroReferencia?: string;
    formaPago?: MfFacturaSuplidorFormaPago;
    montoPagado: number;
    fechaPago: string;
    usuarioReg?: string;
    concepto?: string;
    tipoPago?: number;
    estado: string;
}

export interface MfFacturaSuplidorPagos {
    id: number;
    facturaSuplidor: { id: number };
    monto: number;
    pagado: number;
    fechaPago: string;
    usuarioReg: string;
    fechaAnulado?: string;
    usuarioAnulacion?: string;
    estadoId: string;
    contableId?: number;
    detalles: MfFacturaSuplidorPagosDetalle[];
}
