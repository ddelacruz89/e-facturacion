import apiClient from "../services/apiClient";
import { MgUnidad, MgUnidadSimpleDTO } from "../models/producto";

const api = "/api/v1/producto/unidad";

export function getUnidades(): Promise<MgUnidad[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: MgUnidad[] }) => {
        console.log("Loaded unidades:", x.data);
        return x.data;
    });
}

export function getUnidad(id: number): Promise<MgUnidad> {
    return apiClient.get(`${api}/${id}`).then((x: { data: MgUnidad }) => x.data);
}

export function saveUnidad(unidad: MgUnidad): Promise<MgUnidad> {
    console.log("saveUnidad called with:", unidad);
    console.log("API endpoint:", api);

    return apiClient
        .post(api, unidad)
        .then((x: { data: MgUnidad }) => {
            console.log("saveUnidad response:", x);
            return x.data;
        })
        .catch((error) => {
            console.error("saveUnidad error:", error);
            console.error("Error response:", error.response);
            throw error;
        });
}

export function updateUnidad(id: number, unidad: MgUnidad): Promise<MgUnidad> {
    return apiClient.put(`${api}/${id}`, unidad).then((x: { data: MgUnidad }) => x.data);
}

export function deleteUnidad(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

export function getUnidadesResumen(): Promise<MgUnidadSimpleDTO[]> {
    console.log("getUnidadesResumen called, endpoint:", api + "/resumen");
    return apiClient
        .get(api + "/resumen")
        .then((x: { data: MgUnidadSimpleDTO[] }) => {
            console.log("getUnidadesResumen response:", x);
            console.log("getUnidadesResumen data:", x.data);
            return x.data;
        })
        .catch((error) => {
            console.error("getUnidadesResumen error:", error);
            throw error;
        });
}
