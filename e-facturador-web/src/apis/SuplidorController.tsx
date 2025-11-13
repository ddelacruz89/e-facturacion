import apiClient from "../services/apiClient";
import { InSuplidor } from "../models/inventario";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/inventario/suplidor";

interface ApiResponse<T> {
    status: string;
    content: T;
    error: any;
}

export function getSuplidoresActivos(): Promise<InSuplidor[]> {
    return apiClient
        .get(`${api}/activos`)
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
