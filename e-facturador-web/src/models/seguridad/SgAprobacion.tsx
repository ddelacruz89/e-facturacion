// ─────────────────────────────────────────────────────────────────────────────
// Módulo de Aprobaciones — Modelos TypeScript
// ─────────────────────────────────────────────────────────────────────────────

export type ModoAprobacion = "SECUENCIAL" | "SIN_ORDEN" | "AL_MENOS_UNO";
export type EstadoAprobacion = "PEN" | "APR" | "REC" | "CAN";

// ── Config ────────────────────────────────────────────────────────────────────

export interface SgConfigAprobacionNivel {
    id?: number;
    empresaId?: number;
    nivel: number;
    /** Aprobador fijo. null cuando usaManager = true. */
    aprobador?: { username: string; nombre: string } | null;
    usaManager: boolean;
    usuarioReg?: string;
    fechaReg?: string;
}

export interface SgConfigAprobacion {
    id?: number;
    empresaId?: number;
    tipoDocumento: string;
    nombre: string;
    modoAprobacion: ModoAprobacion;
    activo?: boolean;
    niveles: SgConfigAprobacionNivel[];
    usuarioReg?: string;
    fechaReg?: string;
}

export interface SgConfigAprobacionResumenDTO {
    id: number;
    nombre: string;
    tipoDocumento: string;
    modoAprobacion: ModoAprobacion;
    cantidadNiveles: number;
    activo: boolean;
    fechaReg: string;
    usuarioReg: string;
}

export interface SgConfigAprobacionSearchCriteria {
    tipoDocumento?: string;
    activo?: boolean;
    fechaInicio?: string;
    fechaFin?: string;
}

// ── Runtime ───────────────────────────────────────────────────────────────────

export interface SgAprobacionDetalle {
    id?: number;
    nivel: number;
    aprobador: { username: string; nombre: string };
    esManager: boolean;
    estadoId: EstadoAprobacion;
    comentario?: string;
    fechaRespuesta?: string;
}

export interface SgAprobacion {
    id?: number;
    tipoDocumento: string;
    documentoId: number;
    solicitante: { username: string; nombre: string };
    modoAprobacion: ModoAprobacion;
    /** Estado global PEN | APR | REC | CAN (viene de estadoId de BaseSucursal). */
    estadoId: EstadoAprobacion;
    comentarioFinal?: string;
    fechaSolicitud: string;
    fechaResolucion?: string;
    detalle: SgAprobacionDetalle[];
}

export interface SgAprobacionResumenDTO {
    id: number;
    tipoDocumento: string;
    documentoId: number;
    solicitanteUsername: string;
    solicitanteNombre: string;
    modoAprobacion: ModoAprobacion;
    estadoId: EstadoAprobacion;
    fechaSolicitud: string;
    fechaResolucion?: string;
    totalAprobadores: number;
    pendientes: number;
}

export interface SgAprobacionSearchCriteria {
    tipoDocumento?: string;
    documentoId?: number;
    estadoId?: string;
    solicitante?: string;
    soloMisPendientes?: boolean;
    fechaInicio?: string;
    fechaFin?: string;
}

// ── helpers UI ────────────────────────────────────────────────────────────────

export const MODOS_APROBACION: { value: ModoAprobacion; label: string; descripcion: string }[] = [
    { value: "SECUENCIAL",   label: "Secuencial",   descripcion: "Cada aprobador en orden (1 → 2 → 3)" },
    { value: "SIN_ORDEN",    label: "Sin orden",    descripcion: "Todos deben aprobar, en cualquier orden" },
    { value: "AL_MENOS_UNO", label: "Al menos uno", descripcion: "Basta con que uno apruebe" },
];

export const TIPOS_DOCUMENTO: { value: string; label: string }[] = [
    { value: "REQUISICION", label: "Requisición" },
    { value: "ORDEN_COMPRA", label: "Orden de Compra" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "FACTURA_SUPLIDOR", label: "Factura Suplidor" },
];

export const ESTADO_APROBACION_LABEL: Record<EstadoAprobacion, string> = {
    PEN: "Pendiente",
    APR: "Aprobado",
    REC: "Rechazado",
    CAN: "Cancelado",
};

export const ESTADO_APROBACION_COLOR: Record<EstadoAprobacion, "default" | "warning" | "success" | "error"> = {
    PEN: "warning",
    APR: "success",
    REC: "error",
    CAN: "default",
};
