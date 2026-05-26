export type PrioridadRequisicion = "ALTA" | "MEDIA" | "BAJA";
export type EstadoRequisicion = "PEN" | "PEN_APR" | "APR" | "REC" | "COM" | "ANU";

export interface InRequisicionDetalle {
  id?: number;
  productoId?: number | { id: number; nombreProducto: string; [key: string]: any };
  cantidadSolicitada?: number;
  cantidadAprobada?: number;
  observaciones?: string;
}

export interface InRequisicion {
  id?: number;
  secuencia?: number;
  almacenSolicitanteId?: number;
  almacenOrigenId?: number;
  prioridad?: PrioridadRequisicion;
  observaciones?: string;
  fechaRequerida?: string;
  estadoId?: EstadoRequisicion | string;
  empresaId?: number;
  usuarioReg?: string;
  fechaReg?: string;
  detalles?: InRequisicionDetalle[];
}

export interface InRequisicionSearchCriteria {
  fechaInicio?: string;
  fechaFin?: string;
  almacenSolicitanteId?: number | null;
  almacenOrigenId?: number | null;
  prioridad?: string;
  estadoId?: string;
  page?: number;
  size?: number;
}

export interface InRequisicionResumen {
  id: number;
  secuencia: number;
  fechaReg: string;
  almacenSolicitanteNombre: string;
  almacenOrigenNombre: string;
  prioridad: PrioridadRequisicion;
  usuarioReg: string;
  estadoId: EstadoRequisicion;
}
