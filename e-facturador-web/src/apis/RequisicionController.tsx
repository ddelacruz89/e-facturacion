import apiClient from "../services/apiClient";
import { InRequisicion, InRequisicionSearchCriteria, InRequisicionResumen } from "../models/inventario/InRequisicion";

interface ApiResponse<T> {
    status?: string;
    content?: T;
    error?: any;
}

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const BASE_URL = "/api/v1/inventario/requisiciones";

function unwrapContent<T>(data: ApiResponse<T> | T): T {
    return (data as ApiResponse<T>)?.content !== undefined
        ? ((data as ApiResponse<T>).content as T)
        : (data as T);
}

export function buscarRequisiciones(criteria: InRequisicionSearchCriteria): Promise<Page<InRequisicionResumen>> {
    return apiClient
        .post(`${BASE_URL}/buscar`, criteria)
        .then((x: { data: any }) => unwrapContent<Page<InRequisicionResumen>>(x.data));
}

export function getRequisicion(id: number): Promise<InRequisicion> {
    return apiClient
        .get(`${BASE_URL}/${id}`)
        .then((x: { data: ApiResponse<InRequisicion> | InRequisicion }) =>
            unwrapContent<InRequisicion>(x.data)
        );
}

export function getRequisiciones(): Promise<InRequisicion[]> {
    return apiClient
        .get(BASE_URL)
        .then((x: { data: ApiResponse<InRequisicion[]> | InRequisicion[] }) =>
            unwrapContent<InRequisicion[]>(x.data)
        );
}

export function saveRequisicion(requisicion: InRequisicion): Promise<InRequisicion> {
    return apiClient
        .post(BASE_URL, requisicion)
        .then((x: { data: ApiResponse<InRequisicion> | InRequisicion }) =>
            unwrapContent<InRequisicion>(x.data)
        );
}

export function updateRequisicion(id: number, requisicion: InRequisicion): Promise<InRequisicion> {
    return apiClient
        .put(`${BASE_URL}/${id}`, requisicion)
        .then((x: { data: ApiResponse<InRequisicion> | InRequisicion }) =>
            unwrapContent<InRequisicion>(x.data)
        );
}

export function disableRequisicion(id: number): Promise<void> {
    return apiClient.delete(`${BASE_URL}/${id}`).then(() => undefined);
}
