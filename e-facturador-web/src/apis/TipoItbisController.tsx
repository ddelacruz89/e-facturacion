import apiClient from "../services/apiClient";
import { MgItbis } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

var api = "/api/v1/facturacion/itbis";
export function getTipoItbis(): Promise<MgItbis[]> {
    return apiClient
        .get(api.concat("/all"))
        .then((x: { data: MgItbis[] }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}
export function saveTipoItbis(tipoItbis: MgItbis): Promise<MgItbis | any> {
    console.log("saveTipoItbis", tipoItbis);
    return apiClient
        .post(api, tipoItbis)
        .then((x: { data: MgItbis }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return { nombre: "", itbis: 0 };
        });
}
