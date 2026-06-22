import apiClient from "../services/apiClient";
import { SgNotificacionTipoConfigDTO } from "../models/seguridad";

const api = "/api/v1/notificaciones";

export interface SgNotificacionDTO {
    id: number;
    empresaId: number;
    sucursalId?: number;
    modulo: string;
    tipo: string;
    titulo: string;
    descripcion?: string;
    referenciaId?: number;
    referenciaTipo?: string;
    payload?: Record<string, unknown>;
    estadoId: string;
    fechaReg: string;
    usuarioReg: string;
    visto: boolean;
}

export function getNotificaciones(): Promise<SgNotificacionDTO[]> {
    return apiClient.get(api).then((x: { data: SgNotificacionDTO[] }) => x.data);
}

export function getNotificacionesByModulo(modulo: string): Promise<SgNotificacionDTO[]> {
    return apiClient
        .get(`${api}/modulo/${modulo}`)
        .then((x: { data: SgNotificacionDTO[] }) => x.data);
}

export function getContadorNoVistas(): Promise<number> {
    return apiClient
        .get(`${api}/contador`)
        .then((x: { data: { noVistas: number } }) => x.data.noVistas)
        .catch(() => 0);
}

export function marcarVisto(id: number): Promise<void> {
    return apiClient.post(`${api}/${id}/visto`);
}

export function cerrarNotificacion(id: number): Promise<void> {
    return apiClient.put(`${api}/${id}/cerrar`);
}

export function getNotificacionesLogin(): Promise<SgNotificacionDTO[]> {
    return apiClient.get(`${api}/login`).then((x: { data: SgNotificacionDTO[] }) => x.data);
}

export function getTodosTipos(): Promise<SgNotificacionTipoConfigDTO[]> {
    return apiClient
        .get(`${api}/tipos`)
        .then((x: { data: SgNotificacionTipoConfigDTO[] }) => x.data);
}

export function getTiposConSuscripcion(username: string): Promise<SgNotificacionTipoConfigDTO[]> {
    return apiClient
        .get(`${api}/tipos/${username}`)
        .then((x: { data: SgNotificacionTipoConfigDTO[] }) => x.data);
}

export function saveSuscripciones(username: string, tipoIds: string[]): Promise<void> {
    return apiClient.put(`${api}/tipos/${username}/suscripciones`, tipoIds);
}
