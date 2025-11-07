import apiClient from "../services/apiClient";
import { MgItbis } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

var api = "/api/itbis/tipo";
export function getTipoItbis(): Promise<MgItbis[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: { content: MgItbis[] } }) => x.data.content).catch(error => {
        const response: DataNotFound = error.response.data.error;
        console.error("Mensaje:", response.message);
        return []
    });;
}
export function saveTipoItbis(tipoFactura: MgItbis): Promise<MgItbis | any> {
    console.log("saveTipoItbis", tipoFactura);
    return apiClient.post(api, tipoFactura).then((x: { data: { content: MgItbis } }) => x.data.content).catch(error => {
        const response: DataNotFound = error.response.data.error;
        console.error("Mensaje:", response.message);
        return { nombre: "", itbis: "" }
    });;
}
