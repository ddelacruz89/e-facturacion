import { BaseSucursal } from "../BaseSucursal";
import { InSuplidor } from "./InSuplidor";
import { MgProducto } from "../producto";

// InCotizacion entity
export interface InCotizacion extends BaseSucursal {
    id?: number;
    descripcion?: string;
    prioridad?: string;
    // Relationships
    inCotizacionesDetallesCollection?: InCotizacionDetalle[];
}

// InCotizacionDetalle entity
export interface InCotizacionDetalle {
    id?: number;
    cantidad?: number;
    cantidadTablar?: number;
    cantidadPedida?: number;
    ordenCompraId?: number;
    inventarioActual?: string;
    precioVenta?: number;
    precioCompra?: number;
    subTotal?: number;
    itbisPorciento?: number;
    itbis?: number;
    total?: number;
    estado?: string;

    // Foreign keys
    cotizacionId?: number | InCotizacion;
    suplidorId?: number | InSuplidor;
    productoId?: number | MgProducto;
}

// DTOs for forms and display
export interface InCotizacionFormDTO {
    id?: number;
    descripcion?: string;
    prioridad?: string;
    sucursalId?: number;
    detalles?: InCotizacionDetalleFormDTO[];
}

export interface InCotizacionDetalleFormDTO {
    id?: number;
    cantidad?: number;
    cantidadTablar?: number;
    cantidadPedida?: number;
    precioVenta?: number;
    precioCompra?: number;
    subTotal?: number;
    itbisPorciento?: number;
    itbis?: number;
    total?: number;
    suplidorId?: number;
    productoId?: number;
}

// Simple DTO for cotizacion resumen endpoint
export interface InCotizacionSimpleDTO {
    id: number;
    descripcion?: string;
    prioridad?: string;
}
