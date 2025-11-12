import apiClient from "../services/apiClient";
import { MgItbis } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/mg";

export function getItbisActivos(): Promise<MgItbis[]> {
    return apiClient
        .get(`${api}/get_itbis_activos`)
        .then((x: { data: MgItbis[] }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}
