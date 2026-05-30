export interface Cliente {
    id: number
    empresaId: number
    secuencia: number
    tipoIdentificacion: number
    numeroIdentificacion: string
    razonSocial: string
    telefono: string
    direccion: string
    // Dirección de entrega estructurada (opcionales)
    direccionEntrega?: string
    sector?: string
    ciudad?: string
    referencia?: string
    email: string
    credito: number
    activo: boolean
    aplicaCredito: boolean
    porcientoDescuento: number
    tipoComprobanteId: number
}
