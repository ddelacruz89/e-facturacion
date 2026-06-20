export interface HdEstado {
    id: string;
    nombre: string;
    descripcion?: string;
    orden: number;
    esFinal: boolean;
}

export interface HdPrioridad {
    id: string;
    nombre: string;
    slaHoras: number;
    orden: number;
}

export interface HdAdjunto {
    id: number;
    nombreArchivo: string;
    mimeType: string;
    tamanioBytes: number;
    autor: string;
    fechaReg: string;
}

export interface HdComentario {
    id: number;
    contenido: string;
    autor: string;
    origen: "CLIENTE" | "SOPORTE";
    fechaReg: string;
    adjuntos: HdAdjunto[];
}

export interface HdHistorial {
    estadoAnterior?: string;
    estadoNuevo: string;
    observacion?: string;
    fecha: string;
    usuario: string;
}

export interface HdTicketResumen {
    id: number;
    titulo: string;
    estadoId: string;
    estadoNombre: string;
    prioridadId: string;
    prioridadNombre: string;
    fechaReg: string;
    fechaLimite: string;
    proximoAVencer: boolean;
}

export interface HdTicketDetalle {
    id: number;
    titulo: string;
    descripcion: string;
    estadoId: string;
    estadoNombre: string;
    prioridadId: string;
    prioridadNombre: string;
    fechaReg: string;
    usuarioReg: string;
    fechaLimite: string;
    fechaCierre?: string;
    comentarios: HdComentario[];
    adjuntos: HdAdjunto[];
    historial: HdHistorial[];
    soporteAsignado: string[];
}

export interface HdTicketCreateForm {
    titulo: string;
    descripcion: string;
    prioridadId: string;
    fechaLimite?: string;
}

export interface HdComentarioCreateForm {
    contenido: string;
}

export interface PageResult<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
