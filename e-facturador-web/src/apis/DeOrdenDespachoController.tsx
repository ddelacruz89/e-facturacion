import apiClient from "../services/apiClient";
import {
    DeOrdenDespacho,
    DeOrdenDespachoResumen,
    DeOrdenDespachoSearchCriteria,
    MarcarEstadoDTO,
    MisEntregasRutaDTO,
} from "../models/despacho/DespachoModels";

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const BASE_URL = "/api/v1/despacho/ordenes";

function unwrapContent<T>(data: any): T {
    return data?.content !== undefined ? data.content : data;
}

export function buscarOrdenesDespacho(
    criteria: DeOrdenDespachoSearchCriteria
): Promise<Page<DeOrdenDespachoResumen>> {
    return apiClient
        .post(`${BASE_URL}/buscar`, criteria)
        .then((x) => unwrapContent<Page<DeOrdenDespachoResumen>>(x.data));
}

export function getOrdenDespacho(id: number): Promise<DeOrdenDespacho> {
    return apiClient
        .get(`${BASE_URL}/${id}`)
        .then((x) => unwrapContent<DeOrdenDespacho>(x.data));
}

export function getOrdenesPendientes(): Promise<DeOrdenDespacho[]> {
    return apiClient
        .get(`${BASE_URL}/pendientes`)
        .then((x) => unwrapContent<DeOrdenDespacho[]>(x.data));
}

export function saveOrdenDespacho(orden: DeOrdenDespacho): Promise<DeOrdenDespacho> {
    return apiClient
        .post(BASE_URL, orden)
        .then((x) => unwrapContent<DeOrdenDespacho>(x.data));
}

export function updateOrdenDespacho(id: number, orden: DeOrdenDespacho): Promise<DeOrdenDespacho> {
    return apiClient
        .put(`${BASE_URL}/${id}`, orden)
        .then((x) => unwrapContent<DeOrdenDespacho>(x.data));
}

export function marcarEstadoOrden(id: number, dto: MarcarEstadoDTO): Promise<DeOrdenDespacho> {
    return apiClient
        .patch(`${BASE_URL}/${id}/estado`, dto)
        .then((x) => unwrapContent<DeOrdenDespacho>(x.data));
}

export function getMisEntregas(fecha?: string): Promise<MisEntregasRutaDTO[]> {
    const params = fecha ? { fecha } : {};
    return apiClient
        .get(`${BASE_URL}/mis-entregas`, { params })
        .then((x) => unwrapContent<MisEntregasRutaDTO[]>(x.data));
}

export function disableOrdenDespacho(id: number): Promise<void> {
    return apiClient.delete(`${BASE_URL}/${id}`).then(() => undefined);
}
