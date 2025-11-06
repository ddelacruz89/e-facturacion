import apiClient from "../services/apiClient";
import { MgUnidad } from "../models/producto";

const api = "/api/v1/producto/unidad";

export function getUnidades(): Promise<MgUnidad[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: MgUnidad[] }) => x.data);
}

export function getUnidad(id: string): Promise<MgUnidad> {
    return apiClient.get(`${api}/${id}`).then((x: { data: MgUnidad }) => x.data);
}

export function saveUnidad(unidad: MgUnidad): Promise<MgUnidad> {
    return apiClient.post(api, unidad).then((x: { data: MgUnidad }) => x.data);
}

export function updateUnidad(id: string, unidad: MgUnidad): Promise<MgUnidad> {
    return apiClient.put(`${api}/${id}`, unidad).then((x: { data: MgUnidad }) => x.data);
}

export function deleteUnidad(id: string): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}
