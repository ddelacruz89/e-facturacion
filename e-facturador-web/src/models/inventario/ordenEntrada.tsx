import { MgProducto } from "../producto";
import { InSuplidor } from "./InSuplidor";
import { InLote } from "./InLote";

export interface InOrdenEntrada {
    id?: number;
    monto?: number;
    itbis?: number;
    total?: number;
    descuento?: number;
    descuentoPorciento?: number;
    inOrdenDetalleList?: InOrdenEntradaDetalle[];
    almacenId?: number;
}

export interface InOrdenEntradaDetalle {
    id?: number;
    cantidad?: number;
    cantidadTablar?: number;
    lote?: string;
    precioUnitario?: number;
    subTotal?: number;
    itbis?: number;
    total?: number;
    descuentoPorciento?: number;
    extra?: boolean;
    ordenEntradaId?: number | InOrdenEntrada;
    productoId?: number | MgProducto;
    unidadNombre?: string;
    unidadCantidad?: number;
    itbisAlSubTotal?: boolean;
    servicio?: boolean;
    estado?: string;
    suplidorId?: number | InSuplidor;
    inOrdenDetalleLotes?: InOrdenEntradaDetalleLote[];
    anulado?: boolean;
}

export interface InOrdenEntradaDetalleLote {
    id?: number;
    cantidad?: number;
    usuarioReg?: string;
    fechaReg?: Date;
    estado?: string;
    ordenEntradaDetalle?: number | InOrdenEntradaDetalle;
    inLotes?: InLote;
}
