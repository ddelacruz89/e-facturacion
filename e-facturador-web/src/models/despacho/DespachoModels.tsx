export type EstadoOrdenDespacho = "PEN" | "EN_RUTA" | "EN_CAMINO" | "ENTREGADO" | "DEVUELTO" | "ANU";
export type EstadoRutaEntrega = "PLANIFICADA" | "EN_CURSO" | "COMPLETADA" | "ANU";

export interface DeTipoVehiculo {
  id?: number;
  empresaId?: number;
  nombre: string;
  activo?: boolean;
  fechaReg?: string;
  usuarioReg?: string;
}

export interface DeVehiculo {
  id?: number;
  empresaId?: number;
  tipoId: number;
  descripcion: string;
  placa?: string;
  activo?: boolean;
}

export interface DeOrdenDespacho {
  id?: number;
  secuencia?: number;
  empresaId?: number;
  sucursalId?: any;
  facturaId?: number;
  facturaSecuencia?: number;
  clienteId?: number;
  clienteNombre?: string;
  clienteTelefono?: string;
  direccionEntrega?: string;
  fechaCompromiso?: string;
  rutaId?: number;
  notas?: string;
  fechaEntrega?: string;
  usuarioEntrego?: string;
  estadoId?: EstadoOrdenDespacho | string;
  usuarioReg?: string;
  fechaReg?: string;
}

export interface DeRutaEntrega {
  id?: number;
  secuencia?: number;
  empresaId?: number;
  sucursalId?: any;
  fecha?: string;
  vehiculoId?: number;
  conductorUsername?: string;
  notas?: string;
  estadoId?: EstadoRutaEntrega | string;
  usuarioReg?: string;
  fechaReg?: string;
}

export interface DeOrdenDespachoResumen {
  id: number;
  secuencia: number;
  fechaReg: string;
  facturaSecuencia: number;
  clienteNombre: string;
  fechaCompromiso: string;
  conductorUsername?: string;
  estadoId: EstadoOrdenDespacho;
  usuarioReg: string;
}

export interface DeOrdenDespachoSearchCriteria {
  fechaInicio?: string;
  fechaFin?: string;
  facturaSecuencia?: number | null;
  clienteNombre?: string;
  estadoId?: string;
  rutaId?: number | null;
  page?: number;
  size?: number;
}

export interface DeRutaEntregaResumen {
  id: number;
  secuencia: number;
  fechaReg: string;
  fecha: string;
  vehiculoDescripcion: string;
  vehiculoPlaca?: string;
  conductorUsername: string;
  totalOrdenes: number;
  estadoId: EstadoRutaEntrega;
  usuarioReg: string;
}

export interface DeRutaEntregaSearchCriteria {
  fechaInicio?: string;
  fechaFin?: string;
  conductorUsername?: string;
  vehiculoId?: number | null;
  estadoId?: string;
  page?: number;
  size?: number;
}

export interface MisEntregasOrdenDTO {
  id: number;
  secuencia: number;
  facturaId: number;
  facturaSecuencia: number;
  clienteNombre: string;
  clienteTelefono?: string;
  direccionEntrega?: string;
  fechaCompromiso: string;
  fechaEntrega?: string;
  estadoId: EstadoOrdenDespacho;
  notas?: string;
}

export interface MisEntregasRutaDTO {
  rutaId: number;
  rutaSecuencia: number;
  fecha: string;
  vehiculoDescripcion?: string;
  vehiculoPlaca?: string;
  estadoRuta: EstadoRutaEntrega;
  ordenes: MisEntregasOrdenDTO[];
}

export interface MarcarEstadoDTO {
  estadoId: string;
  notas?: string;
}

export interface MfFacturaParaDespacho {
  id: number;
  secuencia: number;
  razonSocial: string;
  clienteId: number;
  total: number;
  fechaReg: string;
}
