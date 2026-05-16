import apiClient from "../services/apiClient";
import { SgUsuario, SgUsuarioResumenDTO, SgUsuarioSearchCriteria } from "../models/seguridad";

const BASE = "api/v1/seguridad/usuario";

export function buscarUsuarios(criteria: SgUsuarioSearchCriteria): Promise<SgUsuarioResumenDTO[]> {
    return apiClient.post(`${BASE}/buscar`, criteria).then((r) => r.data);
}

export function getUsuario(username: string): Promise<SgUsuario> {
    return apiClient.get(`${BASE}/${username}`).then((r) => r.data);
}

export function saveUsuario(usuario: SgUsuario): Promise<SgUsuario> {
    return apiClient.post(BASE, usuario).then((r) => r.data);
}

export function updateUsuario(username: string, usuario: SgUsuario): Promise<SgUsuario> {
    return apiClient.put(`${BASE}/${username}`, usuario).then((r) => r.data);
}
