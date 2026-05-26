import apiClient from "../services/apiClient";
import {
    SgAprobacion,
    SgAprobacionResumenDTO,
    SgAprobacionSearchCriteria,
    SgConfigAprobacion,
    SgConfigAprobacionResumenDTO,
    SgConfigAprobacionSearchCriteria,
} from "../models/seguridad/SgAprobacion";

const BASE = "/api/v1/seguridad/aprobaciones";

function unwrapContent<T>(data: any): T {
    return data?.content !== undefined ? data.content : data;
}

// ── Configuración ─────────────────────────────────────────────────────────────

export function buscarConfig(criteria: SgConfigAprobacionSearchCriteria): Promise<SgConfigAprobacionResumenDTO[]> {
    return apiClient.post(`${BASE}/config/buscar`, criteria).then((r) => unwrapContent<SgConfigAprobacionResumenDTO[]>(r.data));
}

export function getConfig(id: number): Promise<SgConfigAprobacion> {
    return apiClient.get(`${BASE}/config/${id}`).then((r) => unwrapContent<SgConfigAprobacion>(r.data));
}

export function saveConfig(config: SgConfigAprobacion): Promise<SgConfigAprobacion> {
    return apiClient.post(`${BASE}/config`, config).then((r) => unwrapContent<SgConfigAprobacion>(r.data));
}

export function updateConfig(id: number, config: SgConfigAprobacion): Promise<SgConfigAprobacion> {
    return apiClient.put(`${BASE}/config/${id}`, config).then((r) => unwrapContent<SgConfigAprobacion>(r.data));
}

export function desactivarConfig(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/config/${id}`).then(() => undefined);
}

// ── Solicitudes ───────────────────────────────────────────────────────────────

export function getMisPendientes(): Promise<SgAprobacionResumenDTO[]> {
    return apiClient.get(`${BASE}/pendientes`).then((r) => unwrapContent<SgAprobacionResumenDTO[]>(r.data));
}

export function getAprobacion(id: number): Promise<SgAprobacion> {
    return apiClient.get(`${BASE}/${id}`).then((r) => unwrapContent<SgAprobacion>(r.data));
}

export function buscarAprobaciones(criteria: SgAprobacionSearchCriteria): Promise<SgAprobacionResumenDTO[]> {
    return apiClient.post(`${BASE}/buscar`, criteria).then((r) => unwrapContent<SgAprobacionResumenDTO[]>(r.data));
}

export function aprobar(id: number, comentario?: string): Promise<SgAprobacion> {
    return apiClient.post(`${BASE}/${id}/aprobar`, { comentario: comentario ?? "" })
        .then((r) => unwrapContent<SgAprobacion>(r.data));
}

export function rechazar(id: number, comentario: string): Promise<SgAprobacion> {
    return apiClient.post(`${BASE}/${id}/rechazar`, { comentario })
        .then((r) => unwrapContent<SgAprobacion>(r.data));
}
