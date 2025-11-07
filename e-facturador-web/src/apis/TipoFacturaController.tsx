import apiClient from "../services/apiClient";
import { TipoFactura } from "../models/facturacion";
import { error } from "console";
import { DataNotFound } from "../models/ServerErros";

var api = "/api/facturacion/tipo";
export function getTipoFacturas(): Promise<TipoFactura[]> {
    return apiClient.get(api.concat("/all"))
        .then((x: { data: { content: TipoFactura[] } }) => x.data.content)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return []
        })
}

export function saveTipoFactura(tipoFactura: TipoFactura): Promise<TipoFactura | any> {
    console.log("saveTipoFactura", tipoFactura);
    return apiClient.post(api, tipoFactura)
        .then((x: { data: { content: TipoFactura } }) => x.data.content)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return { id: 0, nombre: "", activo: false };
        })
}
