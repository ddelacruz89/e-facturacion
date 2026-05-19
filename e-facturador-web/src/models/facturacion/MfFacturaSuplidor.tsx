// ── Resumen (listado / modal de búsqueda) ──────────────────────────────────
export interface MfFacturaSuplidorResumen {
    id: number;
    secuencia?: number;
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

// ── Descuento por renglón ────────────────────────────────────────────────
export interface MfFacturaSuplidorDetalleDescuentoRequest {
    id?: number;
    tipo: '$' | '%';        // tipo de descuento
    valor: number;          // % ingresado o RD$ directo
    monto: number;          // RD$ calculado que se descuenta
}

// ── Detalle ───────────────────────────────────────────────────────────────
export interface MfFacturaSuplidorDetalleRequest {
    id?: number;
    cantidad: number;
    precioUnitario: number;
    montoItem?: number;
    concepto?: string;
    subTotal?: number;
    retencion?: number;            // ISR retenido calculado
    retencionIsrPorciento?: number;   // % ISR viene del header
    retencionItbisPorciento?: number; // % ITBIS viene del header
    montoDescuento?: number;       // suma total de todos los descuentos
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
    descuentos?: MfFacturaSuplidorDetalleDescuentoRequest[]; // lista de descuentos
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
    subTotal?: number;
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
    esCredito?: number;
    // Contabilidad
    contableId?: number;
    cxpId?: number;
    // Detalles
    detalles: MfFacturaSuplidorDetalleRequest[];
}

// ── Respuesta completa del GET /{id} ──────────────────────────────────────
export interface MfFacturaSuplidor extends MfFacturaSuplidorRequest {
    empresaId?: number;
    secuencia?: number;
    usuarioReg?: string;
    fechaReg?: string;
    suplidor?: { id: number; nombre: string };
    tipoFactura?: { id: number; nombre: string };
    retencionIsr?: { id: number; descripcion: string; valor: number };
    retencionItbis?: { id: number; descripcion: string; valor: number };
    detalles: any[];
}
