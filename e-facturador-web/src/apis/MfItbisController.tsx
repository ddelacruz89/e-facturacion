import apiClient from "../services/apiClient";
import { MfItbis, MfItbisRequest } from "../models/facturacion/MfItbis";

const api = "/api/v1/facturacion/mf-itbis";

export function getAllMfItbis(): Promise<MfItbis[]> {
    return apiClient
        .get(api)
        .then((r) => r.data as MfItbis[])
        .catch((error) => {
            console.error("getAllMfItbis error:", error);
            return [];
        });
}

export function getMfItbisById(id: number): Promise<MfItbis | null> {
    return apiClient
        .get(`${api}/${id}`)
        .then((r) => r.data as MfItbis)
        .catch((error) => {
            console.error("getMfItbisById error:", error);
            return null;
        });
}

export function saveMfItbis(dto: MfItbisRequest): Promise<MfItbis> {
    return apiClient.post(api, dto).then((r) => r.data as MfItbis);
}

export function updateMfItbis(id: number, dto: MfItbisRequest): Promise<MfItbis> {
    return apiClient.put(`${api}/${id}`, dto).then((r) => r.data as MfItbis);
}
