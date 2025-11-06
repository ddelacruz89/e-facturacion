import apiClient from "../services/apiClient";
import { MgItbis } from "../models/facturacion";

const api = "/api/v1/facturacion/itbis";

export function getItbisOptions(): Promise<MgItbis[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: MgItbis[] }) => x.data);
}

export function getItbisActivos(): Promise<MgItbis[]> {
    return apiClient.get(api).then((x: { data: MgItbis[] }) => x.data);
}

export function getItbis(id: number): Promise<MgItbis> {
    return apiClient.get(`${api}/${id}`).then((x: { data: MgItbis }) => x.data);
}

export function saveItbis(itbis: MgItbis): Promise<MgItbis> {
    return apiClient.post(api, itbis).then((x: { data: MgItbis }) => x.data);
}
