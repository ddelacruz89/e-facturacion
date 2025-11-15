import apiClient from "../services/apiClient";
import { InSuplidor, InSuplidorSimpleDTO } from "../models/inventario";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/inventario/suplidores";

interface ApiResponse<T> {
    status: string;
    content: T;
    error: any;
}

export function getSuplidoresActivos(): Promise<InSuplidor[]> {
    return apiClient
        .get(api)
        .then((x: { data: ApiResponse<InSuplidor[]> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}

export function getSuplidores(): Promise<InSuplidor[]> {
    return apiClient
        .get(`${api}/all`)
        .then((x: { data: ApiResponse<InSuplidor[]> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}

export function getSuplidorById(id: number): Promise<InSuplidor> {
    return apiClient
        .get(`${api}/${id}`)
        .then((x: { data: ApiResponse<InSuplidor> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            throw error;
        });
}

export function getSuplidorByRnc(rnc: string): Promise<InSuplidor> {
    return apiClient
        .get(`${api}/rnc/${rnc}`)
        .then((x: { data: ApiResponse<InSuplidor> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            throw error;
        });
}

export function saveOrUpdateSuplidor(suplidor: InSuplidor): Promise<InSuplidor> {
    if (suplidor.id === undefined || suplidor.id === 0) {
        return createSuplidor(suplidor);
    } else {
        return updateSuplidor(suplidor);
    }
}

export function createSuplidor(suplidor: InSuplidor): Promise<InSuplidor> {
    return apiClient
        .post(api, suplidor)
        .then((x: { data: ApiResponse<InSuplidor> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            throw error;
        });
}

export function updateSuplidor(suplidor: InSuplidor): Promise<InSuplidor> {
    return apiClient
        .put(`${api}/${suplidor.id}`, suplidor)
        .then((x: { data: ApiResponse<InSuplidor> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            throw error;
        });
}

export function deleteSuplidor(id: number): Promise<void> {
    return apiClient
        .delete(`${api}/${id}`)
        .then((x: { data: ApiResponse<any> }) => {})
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            throw error;
        });
}

export function getSuplidoresResumen(): Promise<InSuplidorSimpleDTO[]> {
    console.log("getSuplidoresResumen called, endpoint:", api + "/resumen");
    return apiClient
        .get(api + "/resumen")
        .then((x: { data: ApiResponse<InSuplidorSimpleDTO[]> }) => {
            console.log("getSuplidoresResumen response:", x);
            console.log("getSuplidoresResumen data:", x.data.content);
            return x.data.content;
        })
        .catch((error) => {
            console.error("getSuplidoresResumen error:", error);
            throw error;
        });
}
