// Inventario module models

export interface InAlmacen {
    id?: number;
    nombre: string;
    descripcion?: string;
    activo?: boolean;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
}

// Simple DTO for suplidor resumen endpoint
export interface InSuplidorSimpleDTO {
    id: number;
    nombre: string;
    rnc?: string;
}

// Re-export from individual files
export type { InSuplidor } from "./InSuplidor";
export type {
    InCotizacion,
    InCotizacionDetalle,
    InCotizacionFormDTO,
    InCotizacionDetalleFormDTO,
    InCotizacionSimpleDTO,
} from "./cotizacion";
export type {
    InOrdenCompra,
    InOrdenCompraDetalle,
    InOrdenCompraFormDTO,
    InOrdenCompraDetalleFormDTO,
    InOrdenCompraSimpleDTO,
} from "./ordenCompra";
export type { InOrdenEntrada, InOrdenEntradaDetalle, InOrdenEntradaDetalleLote } from "./ordenEntrada";
export type {
    InRequisicion,
    InRequisicionDetalle,
    InRequisicionSearchCriteria,
    InRequisicionResumen,
    PrioridadRequisicion,
    EstadoRequisicion,
} from "./InRequisicion";

export interface InLote {
  lote: string;
  productoId?: {
    id: number;
    nombreProducto?: string;
  };
  serie?: boolean;
  fechaVencimiento?: string | null;
  fechaAlertaVencimiento?: string | null;
  alertasDias?: number | null;
  estadoId?: string;
  empresaId?: number;
  sucursalId?: { id: number };
  usuarioReg?: string;
  fechaReg?: string;
}

export interface InLoteResumenDTO {
  lote: string;
  productoId: number;
  productoNombre: string;
  fechaVencimiento?: string | null;
  estadoId?: string;
  usuarioReg?: string;
  fechaReg?: string;
}

export interface InLoteUpdateDTO {
  serie?: boolean;
  fechaVencimiento?: string | null;
  fechaAlertaVencimiento?: string | null;
  alertasDias?: number | null;
  estadoId?: string;
}
