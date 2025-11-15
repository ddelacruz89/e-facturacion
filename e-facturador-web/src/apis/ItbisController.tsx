import apiClient from "../services/apiClient";
import { MgItbis, MgItbisSimpleDTO } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1";

export function getItbisActivos(): Promise<MgItbis[]> {
    return apiClient
        .get(`${api}/mg/itbis`)
        .then((x: { data: MgItbis[] }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}

export function getItbisResumen(): Promise<MgItbisSimpleDTO[]> {
    console.log("getItbisResumen called, endpoint:", `${api}/mg/itbis/resumen`);
    return apiClient
        .get(`${api}/mg/itbis/resumen`)
        .then((x: { data: MgItbisSimpleDTO[] }) => {
            console.log("getItbisResumen response:", x);
            console.log("getItbisResumen data:", x.data);
            return x.data;
        })
        .catch((error) => {
            console.error("getItbisResumen error:", error);
            throw error;
        });
}
