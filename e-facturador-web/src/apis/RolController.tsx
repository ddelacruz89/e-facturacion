import apiClient from "../services/apiClient";
import { SgRol, SgRolResumenDTO, SgRolSearchCriteria, SgUsuarioRol } from "../models/seguridad";

const BASE = "api/v1/seguridad/rol";

export function buscarRoles(criteria: SgRolSearchCriteria): Promise<SgRolResumenDTO[]> {
    return apiClient.post(`${BASE}/buscar`, criteria).then((r) => r.data);
}

export function getRol(id: number): Promise<SgRol> {
    return apiClient.get(`${BASE}/${id}`).then((r) => r.data);
}

export function saveRol(rol: SgRol): Promise<SgRol> {
    return apiClient.post(BASE, rol).then((r) => r.data);
}

export function updateRol(id: number, rol: SgRol): Promise<SgRol> {
    return apiClient.put(`${BASE}/${id}`, rol).then((r) => r.data);
}

// ---- Usuario-Rol ----

export function getUsuariosRol(rolId: number): Promise<SgUsuarioRol[]> {
    return apiClient.get(`${BASE}/${rolId}/usuarios`).then((r) => r.data);
}

export function addUsuarioRol(rolId: number, username: string): Promise<SgUsuarioRol> {
    return apiClient.post(`${BASE}/${rolId}/usuarios`, { username }).then((r) => r.data);
}

export function removeUsuarioRol(rolId: number, asignacionId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${rolId}/usuarios/${asignacionId}`).then(() => undefined);
}
