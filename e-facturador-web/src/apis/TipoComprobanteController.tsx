import apiClient from "../services/apiClient";
import { TipoComprobante } from "../models/facturacion";

var api = "/api/facturacion/tipo/comprobante";
export function getTipoComprobantes(): Promise<TipoComprobante[]> {
    try {
        return apiClient.get(api.concat("/all")).then((x: { data: { content: TipoComprobante[] } }) => x.data.content);
    } catch (error) {
        return Promise.reject([]);
    }
}
export function saveTipoComprobante(tipoFactura: TipoComprobante): Promise<TipoComprobante> {
    console.log("saveTipoFactura", tipoFactura);
    return apiClient.post(api, tipoFactura).then((x: { data: { content: TipoComprobante } }) => x.data.content);
}
