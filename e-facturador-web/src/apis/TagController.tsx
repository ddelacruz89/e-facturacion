import apiClient from "../services/apiClient";
import { MgTag } from "../models/producto/MgTag";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/producto/tag";

interface ApiResponse<T> {
    status: string;
    content: T;
    error: any;
}

export function getTagsActivos(): Promise<MgTag[]> {
    return apiClient
        .get(`${api}/activos`)
        .then((x: { data: ApiResponse<MgTag[]> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}

export function getTags(): Promise<MgTag[]> {
    return apiClient
        .get(`${api}/all`)
        .then((x: { data: ApiResponse<MgTag[]> }) => x.data.content)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}
