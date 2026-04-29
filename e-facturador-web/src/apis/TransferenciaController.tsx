import apiClient from "../services/apiClient";
import { InTransferencia, InTransferenciaRequestDTO } from "../models/inventario/transferencia";

const api = "/api/v1/inventario/transferencias";

export function getTransferencias(): Promise<InTransferencia[]> {
    return apiClient.get(api).then((x: { data: { content: InTransferencia[] } }) => x.data.content ?? x.data);
}

export function getTransferencia(id: number): Promise<InTransferencia> {
    return apiClient.get(`${api}/${id}`).then((x: { data: { content: InTransferencia } }) => x.data.content ?? x.data);
}

export function createTransferencia(data: InTransferenciaRequestDTO): Promise<InTransferencia> {
    return apiClient.post(api, data).then((x: { data: { content: InTransferencia } }) => x.data.content ?? x.data);
}

export function updateTransferencia(id: number, data: InTransferenciaRequestDTO): Promise<InTransferencia> {
    return apiClient.put(`${api}/${id}`, data).then((x: { data: { content: InTransferencia } }) => x.data.content ?? x.data);
}

export function anularTransferencia(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

export function getStockProductoEnAlmacen(
    productoId: number,
    almacenId: number
): Promise<{ productoId: number; almacenId: number; cantidad: number }> {
    return apiClient
        .get(`${api}/stock`, { params: { productoId, almacenId } })
        .then((x: { data: { content: { productoId: number; almacenId: number; cantidad: number } } }) => x.data.content ?? x.data);
}
