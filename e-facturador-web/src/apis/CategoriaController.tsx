import apiClient from "../services/apiClient";
import { MgCategoria } from "../models/producto";

const api = "/api/v1/producto/categoria";

export function getCategorias(): Promise<MgCategoria[]> {
    console.log("getCategorias called, endpoint:", api);
    return apiClient
        .get(api)
        .then((x: { data: MgCategoria[] }) => {
            console.log("getCategorias response:", x);
            console.log("getCategorias data:", x.data);
            return x.data;
        })
        .catch((error) => {
            console.error("getCategorias error:", error);
            throw error;
        });
}

export function getAllCategorias(): Promise<MgCategoria[]> {
    console.log("getAllCategorias called, endpoint:", api + "/all");
    return apiClient
        .get(api + "/all")
        .then((x: { data: MgCategoria[] }) => {
            console.log("getAllCategorias response:", x);
            console.log("getAllCategorias data:", x.data);
            return x.data;
        })
        .catch((error) => {
            console.error("getAllCategorias error:", error);
            throw error;
        });
}

export function getCategoria(id: string): Promise<MgCategoria> {
    return apiClient.get(`${api}/${id}`).then((x: { data: MgCategoria }) => x.data);
}

export function saveCategoria(categoria: MgCategoria): Promise<MgCategoria> {
    return apiClient.post(api, categoria).then((x: { data: MgCategoria }) => x.data);
}

export function updateCategoria(id: string, categoria: MgCategoria): Promise<MgCategoria> {
    return apiClient.put(`${api}/${id}`, categoria).then((x: { data: MgCategoria }) => x.data);
}

export function deleteCategoria(id: string): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}
