import apiClient from "../services/apiClient";
import { SgEmpresaIpPermitida } from "../models/seguridad";

const BASE = "api/v1/seguridad/ip-permitida";

export function getIpsPermitidas(): Promise<SgEmpresaIpPermitida[]> {
    return apiClient.get(BASE).then((r) => r.data);
}

export function saveIpPermitida(ip: SgEmpresaIpPermitida): Promise<SgEmpresaIpPermitida> {
    return apiClient.post(BASE, ip).then((r) => r.data);
}

export function toggleIpPermitida(id: number): Promise<SgEmpresaIpPermitida> {
    return apiClient.patch(`${BASE}/${id}/toggle`).then((r) => r.data);
}

export function deleteIpPermitida(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`).then((r) => r.data);
}
