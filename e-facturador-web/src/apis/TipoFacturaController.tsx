import apiClient from "../services/apiClient";
import { TipoFactura } from "../models/facturacion";

var api = "/api/facturacion/tipo";
export function getTipoFacturas(): Promise<TipoFactura[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: { content: TipoFactura[] } }) => x.data.content);
}
export function saveTipoFactura(tipoFactura: TipoFactura): Promise<TipoFactura> {
    console.log("saveTipoFactura", tipoFactura);
    return apiClient.post(api, tipoFactura).then((x: { data: { content: TipoFactura } }) => x.data.content);
}
