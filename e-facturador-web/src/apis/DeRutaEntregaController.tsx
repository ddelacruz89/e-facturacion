import apiClient from "../services/apiClient";
import {
    DeRutaEntrega,
    DeRutaEntregaResumen,
    DeRutaEntregaSearchCriteria,
} from "../models/despacho/DespachoModels";

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const BASE_URL = "/api/v1/despacho/rutas";

function unwrapContent<T>(data: any): T {
    return data?.content !== undefined ? data.content : data;
}

export function buscarRutasEntrega(
    criteria: DeRutaEntregaSearchCriteria
): Promise<Page<DeRutaEntregaResumen>> {
    return apiClient
        .post(`${BASE_URL}/buscar`, criteria)
        .then((x) => unwrapContent<Page<DeRutaEntregaResumen>>(x.data));
}

export function getRutaEntrega(id: number): Promise<DeRutaEntrega> {
    return apiClient
        .get(`${BASE_URL}/${id}`)
        .then((x) => unwrapContent<DeRutaEntrega>(x.data));
}

export function saveRutaEntrega(ruta: DeRutaEntrega): Promise<DeRutaEntrega> {
    return apiClient
        .post(BASE_URL, ruta)
        .then((x) => unwrapContent<DeRutaEntrega>(x.data));
}

export function updateRutaEntrega(id: number, ruta: DeRutaEntrega): Promise<DeRutaEntrega> {
    return apiClient
        .put(`${BASE_URL}/${id}`, ruta)
        .then((x) => unwrapContent<DeRutaEntrega>(x.data));
}

export function asignarOrdenesARuta(
    rutaId: number,
    ordenIds: number[]
): Promise<DeRutaEntrega> {
    return apiClient
        .post(`${BASE_URL}/${rutaId}/asignar-ordenes`, { ordenIds })
        .then((x) => unwrapContent<DeRutaEntrega>(x.data));
}

export function asignarFacturasARuta(rutaId: number, facturaIds: number[]): Promise<DeRutaEntrega> {
    return apiClient
        .post(`${BASE_URL}/${rutaId}/asignar-facturas`, { facturaIds })
        .then((x) => unwrapContent<DeRutaEntrega>(x.data));
}

export function cambiarEstadoRuta(rutaId: number, estadoId: string): Promise<DeRutaEntrega> {
    return apiClient
        .patch(`${BASE_URL}/${rutaId}/estado`, { estadoId })
        .then((x) => unwrapContent<DeRutaEntrega>(x.data));
}

export function disableRutaEntrega(id: number): Promise<void> {
    return apiClient.delete(`${BASE_URL}/${id}`).then(() => undefined);
}
