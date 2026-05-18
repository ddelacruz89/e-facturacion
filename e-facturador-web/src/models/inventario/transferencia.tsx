export interface InTransferenciaDetalle {
    id?: number;
    productoId: number | { id: number; nombreProducto: string; [key: string]: any };
    /** Cantidad realmente transferida (puede ser menor que cantSolicitada si habia stock insuficiente). */
    cant: number;
    /** Cantidad que el usuario solicito transferir originalmente. */
    cantSolicitada?: number;
    lote?: string;
    numeroReferencia?: number;
    cantidadUnidad?: number;
    unidadDescripcion?: string;
}

export interface InTransferencia {
    id?: number;
    origenAlmacenId: number | { id: number; nombre: string; [key: string]: any };
    destinoAlmacenId: number | { id: number; nombre: string; [key: string]: any };
    estadoId?: string;
    empresaId?: number;
    usuarioReg?: string;
    fechaReg?: Date | string;
    detalles: InTransferenciaDetalle[];
}

export interface InTransferenciaRequestDTO {
    origenAlmacenId: number;
    destinoAlmacenId: number;
    estadoId?: string;
    detalles: {
        productoId: number;
        cant: number;
        lote?: string;
        numeroReferencia?: number;
        cantidadUnidad?: number;
        unidadDescripcion?: string;
    }[];
}
