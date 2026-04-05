import { InSuplidor } from "./InSuplidor";
import { MgProducto } from "../producto";

// InOrdenesCompras entity
export interface InOrdenCompra {
    id?: number;
    subTotal?: number;
    itbis?: number;
    total?: number;
    descuento?: number;
    usuarioReg?: string;
    fechaReg?: Date;
    suplidorId?: number | InSuplidor;
    estadoId?: string;
    cotizacionId?: number;
    // Relationships
    inOrdenesComprasDetallesList?: InOrdenCompraDetalle[];
}

// InOrdenesComprasDetalles entity
export interface InOrdenCompraDetalle {
    id?: number;
    cantidad: number;
    precioUnitario: number;
    itbisProducto?: number;
    subTotal: number;
    itbis?: number;
    total?: number;
    ordenCompraId?: number | InOrdenCompra;
    productoId?: number | MgProducto;
    unidadNombre?: string;
    unidadCantidad?: number;
    cantidadTablar?: number;
    descuentoPorciento?: number;
    descuentoCantidad?: number;
    estadoId?: string;
}

// DTOs for forms and display
export interface InOrdenCompraFormDTO {
    id?: number;
    subTotal?: number;
    itbis?: number;
    total?: number;
    descuento?: number;
    suplidorId?: number;
    estadoId?: string;
    cotizacionId?: number;
    detalles?: InOrdenCompraDetalleFormDTO[];
}

export interface InOrdenCompraDetalleFormDTO {
    id?: number;
    cantidad: number;
    precioUnitario: number;
    itbisProducto?: number;
    subTotal: number;
    itbis?: number;
    total?: number;
    productoId?: number | MgProducto;
    unidadNombre?: string;
    unidadCantidad?: number;
    cantidadTablar?: number;
    descuentoPorciento?: number;
    descuentoCantidad?: number;
    estadoId?: string;
}

// Simple DTO for orden compra resumen endpoint
export interface InOrdenCompraSimpleDTO {
    id: number;
    fechaReg?: Date;
    suplidorNombre?: string;
    total?: number;
    estadoId?: string;
}
