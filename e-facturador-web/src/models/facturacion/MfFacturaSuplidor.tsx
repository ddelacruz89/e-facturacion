// ── Resumen (listado / modal de búsqueda) ──────────────────────────────────
export interface MfFacturaSuplidorResumen {
    id: number;
    fechaReg: string;
    suplidorNombre: string;
    numeroFactura: string;
    ncf: string;
    total: number;
    estadoId: string;
    usuarioReg: string;
}

// ── Criterios de búsqueda ─────────────────────────────────────────────────
export interface MfFacturaSuplidorSearchCriteria {
    sucursalId?: number | null;
    suplidorId?: number | null;
    numeroFactura?: string;
    estadoId?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

// ── Detalle ───────────────────────────────────────────────────────────────
export interface MfFacturaSuplidorDetalleRequest {
    id?: number;
    cantidad: number;
    precioUnitario: number;
    montoItem?: number;
    concepto?: string;
    subtotal?: number;
    retencion?: number;            // ISR retenido calculado
    retencionIsrPorciento?: number;   // % ISR viene del header
    retencionItbisPorciento?: number; // % ITBIS viene del header
    montoDescuento?: number;
    montoRecargo?: number;
    itbis?: number;
    montoItbisRetenido?: number;
    itbisId: number;
    itbisPorciento?: number;
    total?: number;
    indicadorBienServicio?: number; // 1 = Bien, 2 = Servicio
    contableId?: number;            // Cuentas de Costo
    centroCostosId?: number;        // Centro de costos
    estado?: string;
    formaPagoId?: number;
}

// ── Cabecera (request / form) ─────────────────────────────────────────────
export interface MfFacturaSuplidorRequest {
    id?: number;
    sucursalId?: number;
    suplidorId?: number;
    numeroFactura?: string;
    tipoIngreso?: number;
    fechaEmision?: string;
    fechaLimitePago?: string;
    fechaVencimiento?: string;
    estadoId?: string;
    // DgII
    ncf?: string;
    tipoCfId?: string;
    razonSocial?: string;
    rnc?: string;
    // Montos
    tipoPago?: number;
    concepto?: string;
    subtotal?: number;
    itbis?: number;
    descuento?: number;
    total?: number;
    pago?: number;
    montoAnulado?: number;
    montoRetencionItbis?: number;
    // Retenciones
    retencionIsrId?: number;
    montoRetencionIsr?: number;
    retencionItbisId?: number;
    // Tipo factura
    tipoFacturaId?: number;
    esCredito?: boolean;
    // Contabilidad
    contableId?: number;
    cxpId?: number;
    // Detalles
    detalles: MfFacturaSuplidorDetalleRequest[];
}

// ── Respuesta completa del GET /{id} ──────────────────────────────────────
export interface MfFacturaSuplidor extends MfFacturaSuplidorRequest {
    empresaId?: number;
    usuarioReg?: string;
    fechaReg?: string;
    suplidor?: { id: number; nombre: string };
    tipoFactura?: { id: number; nombre: string };
    retencionIsr?: { id: number; descripcion: string; valor: number };
    retencionItbis?: { id: number; descripcion: string; valor: number };
    detalles: any[];
}
