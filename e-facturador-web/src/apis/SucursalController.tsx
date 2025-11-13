import apiClient from "../services/apiClient";
import { SgSucursal } from "../models/seguridad/SgSucursal";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/seguridad/sucursales";

interface ApiResponse<T> {
    status: string;
    content: T;
    error: any;
}

export function getSucursalesActivas(): Promise<SgSucursal[]> {
    return apiClient
        .get(`${api}`)
        .then((x: { data: ApiResponse<SgSucursal[]> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}

export function getSucursales(): Promise<SgSucursal[]> {
    return apiClient
        .get(`${api}/all`)
        .then((x: { data: ApiResponse<SgSucursal[]> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}
