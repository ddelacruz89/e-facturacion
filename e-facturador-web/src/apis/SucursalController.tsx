import apiClient from "../services/apiClient";
import { SgSucursal } from "../models/seguridad/SgSucursal";
import { DataNotFound } from "../models/ServerErros";
import { createSharedHook } from "../hooks/useSharedData";

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

export function getSucursalById(id: number): Promise<SgSucursal> {
    return apiClient
        .get(`${api}/${id}`)
        .then((x: { data: ApiResponse<SgSucursal> }) => x.data.content);
}

export function saveSucursal(sucursal: SgSucursal): Promise<SgSucursal> {
    return apiClient
        .post(api, sucursal)
        .then((x: { data: ApiResponse<SgSucursal> }) => x.data.content);
}

export function updateSucursal(id: number, sucursal: SgSucursal): Promise<SgSucursal> {
    return apiClient
        .put(`${api}/${id}`, sucursal)
        .then((x: { data: ApiResponse<SgSucursal> }) => x.data.content);
}

export function disableSucursal(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`).then(() => {});
}

/**
 * Hook compartido (singleton) para getSucursalesActivas.
 * Sin importar cuántos componentes lo usen, el API se llama una sola vez.
 */
export const useSharedSucursalesActivas = createSharedHook(getSucursalesActivas);

/**
 * Hook compartido (singleton) para getSucursales (/all).
 * Sin importar cuántos componentes lo usen, el API se llama una sola vez.
 */
export const useSharedSucursalesAll = createSharedHook(getSucursales);
