export interface Cliente {
    id: number
    empresaId: number
    secuencia: number
    tipoIdentificacion: number
    numeroIdentificacion: string
    razonSocial: string
    telefono: string
    /** Dirección fiscal (texto libre) */
    direccion: string
    email: string
    credito: number
    activo: boolean
    aplicaCredito: boolean
    porcientoDescuento: number
    tipoComprobanteId: number
    // ── Ubicación de entrega ──────────────────────────────────────────────────
    codProvincia?: string
    municipioId?: number
    barrioId?: number
    subBarrioId?: number
    calle?: string
    referencia?: string
}
