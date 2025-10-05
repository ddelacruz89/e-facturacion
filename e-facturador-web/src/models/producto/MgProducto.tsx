export interface MgProducto {
    id: number;
    empresaId: number;
    codigoBarra: string;
    categoriaId: string;
    nombreProducto: string;
    descripcion: string;
    unidadId: string;
    itbisId: number;
    existencia: number;
    precioVenta: number;
    precioMinimo: number;
    precioCostoAvg: number;
    trabajador: boolean;
    comision: number;
}
