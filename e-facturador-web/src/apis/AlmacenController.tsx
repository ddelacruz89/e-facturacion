import apiClient from "../services/apiClient";
import { InAlmacen } from "../models/inventario";

const api = "/api/v1/inventario/almacenes";

export function getAlmacenes(): Promise<InAlmacen[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: InAlmacen[] }) => x.data);
}

export function getAlmacen(id: number): Promise<InAlmacen> {
    return apiClient.get(`${api}/${id}`).then((x: { data: InAlmacen }) => x.data);
}

export function getAlmacenesActivos(): Promise<InAlmacen[]> {
    return apiClient.get(`${api}`).then((x: { data: InAlmacen[] }) => x.data);
}

export function saveAlmacen(almacen: InAlmacen): Promise<InAlmacen> {
    return apiClient.post(api, almacen).then((x: { data: InAlmacen }) => x.data);
}

export function updateAlmacen(id: number, almacen: InAlmacen): Promise<InAlmacen> {
    return apiClient.put(`${api}/${id}`, almacen).then((x: { data: InAlmacen }) => x.data);
}

export function deleteAlmacen(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}
