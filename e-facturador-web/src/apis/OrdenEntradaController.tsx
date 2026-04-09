import apiClient from "../services/apiClient";
import { InOrdenEntrada } from "../models/inventario";

interface ApiResponse<T> {
    status?: string;
    content?: T;
    error?: any;
}

const ordenEntradaApi = "/api/v1/inventario/orden-entrada";
const ordenCompraApi = "/api/v1/inventario/ordenes-compras";

function unwrapContent<T>(data: ApiResponse<T> | T): T {
    return (data as ApiResponse<T>)?.content !== undefined ? ((data as ApiResponse<T>).content as T) : (data as T);
}

export function getOrdenesEntrada(): Promise<InOrdenEntrada[]> {
    return apiClient.get(ordenEntradaApi).then((x: { data: ApiResponse<InOrdenEntrada[]> | InOrdenEntrada[] }) => {
        return unwrapContent<InOrdenEntrada[]>(x.data);
    });
}

export function getOrdenEntrada(id: number): Promise<InOrdenEntrada> {
    return apiClient.get(`${ordenEntradaApi}/${id}`).then((x: { data: ApiResponse<InOrdenEntrada> | InOrdenEntrada }) => {
        return unwrapContent<InOrdenEntrada>(x.data);
    });
}

export function saveOrdenEntrada(ordenEntrada: InOrdenEntrada): Promise<InOrdenEntrada> {
    return apiClient.post(ordenEntradaApi, ordenEntrada).then((x: { data: ApiResponse<InOrdenEntrada> | InOrdenEntrada }) => {
        return unwrapContent<InOrdenEntrada>(x.data);
    });
}

export function updateOrdenEntrada(id: number, ordenEntrada: InOrdenEntrada): Promise<InOrdenEntrada> {
    return apiClient
        .put(`${ordenEntradaApi}/${id}`, ordenEntrada)
        .then((x: { data: ApiResponse<InOrdenEntrada> | InOrdenEntrada }) => {
            return unwrapContent<InOrdenEntrada>(x.data);
        });
}

export function disableOrdenEntrada(id: number): Promise<void> {
    return apiClient.delete(`${ordenEntradaApi}/${id}`).then(() => undefined);
}

export function convertirOrdenCompraAOrdenEntrada(ordenCompraId: number, almacenId: number): Promise<InOrdenEntrada> {
    return apiClient
        .post(`${ordenCompraApi}/${ordenCompraId}/convertir-orden-entrada`, null, {
            params: { almacenId },
        })
        .then((x: { data: ApiResponse<InOrdenEntrada> | InOrdenEntrada }) => {
            return unwrapContent<InOrdenEntrada>(x.data);
        });
}
