export interface ProductoVenta {
    id: number
    codigoBarra: string
    descripcion: string
    nombreProducto: string
    unidadProductorSuplidor: UnidadProductorSuplidor[]
    secuencia: number
    itbis: number
    precioVenta: number
    precioCostoAvg: number
    inventarios: Inventario[]
    itbisId: ItbisId
    precioItbis: number
}

export interface UnidadProductorSuplidor {
    unidadFraccionId: UnidadFraccionId
    precioVenta: number
}

export interface UnidadFraccionId {
    id: number
    nombre: string
    sigla: string
}

export interface Inventario {
    id: number
    cantidad: number
    almacenId: AlmacenId
    loteId: any
    estadoProductoInventario: string
}

export interface AlmacenId {
    id: number
    nombre: string
    ubicacion: string
}

export interface ItbisId {
    id: number
    nombre: string
    itbis: number
    activo: boolean
}
