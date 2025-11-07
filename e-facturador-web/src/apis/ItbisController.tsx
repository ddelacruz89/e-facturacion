import apiClient from "../services/apiClient";
import { MgItbis } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/facturacion/itbis";

export function getItbisOptions(): Promise<MgItbis[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: MgItbis[] }) => x.data)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return []
        })
}

export function getItbisActivos(): Promise<MgItbis[]> {
    return apiClient.get(api).then((x: { data: MgItbis[] }) => x.data)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return []
        });
}

export function getItbis(id: number): Promise<MgItbis | any> {
    return apiClient.get(`${api}/${id}`).then((x: { data: MgItbis }) => x.data)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return { nombre: "", itbis: "" }
        });
}

export function saveItbis(itbis: MgItbis): Promise<MgItbis | any> {
    return apiClient.post(api, itbis).then((x: { data: MgItbis }) => x.data)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return { nombre: "", itbis: "" }
        });
}
