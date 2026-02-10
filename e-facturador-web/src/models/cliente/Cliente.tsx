export interface Cliente {
    id: number
    empresaId: number
    secuencia: number
    tipoIdentificacion: number
    numeroIdentificacion: string
    razonSocial: string
    telefono: string
    direccion: string
    email: string
    credito: number
    activo: boolean
    aplicaCredito: boolean
    porcientoDescuento: number
    tipoComprobanteId: number
}
