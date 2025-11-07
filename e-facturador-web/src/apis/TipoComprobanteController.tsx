import apiClient from "../services/apiClient";
import { TipoComprobante } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

var api = "/api/facturacion/tipo/comprobante";
export function getTipoComprobantes(): Promise<TipoComprobante[]> {

    return apiClient.get(api.concat("/all")).then((x: { data: { content: TipoComprobante[] } }) => x.data.content)
        .catch(error => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return []
        })

}
export function saveTipoComprobante(tipoFactura: TipoComprobante): Promise<TipoComprobante> {
    console.log("saveTipoFactura", tipoFactura);
    return apiClient.post(api, tipoFactura).then((x: { data: { content: TipoComprobante } }) => x.data.content);
}
