import http from 'axios'
import { TipoItbis } from '../models/facturacion';

var api = "/api/itbis/tipo";
export function getTipoItbis(): Promise<TipoItbis[]> {
    return http.get(api.concat("/all")).then((x: { data: { content: TipoItbis[] } }) => x.data.content)
}
export function saveTipoItbis(tipoFactura: TipoItbis): Promise<TipoItbis> {
    console.log("saveTipoItbis", tipoFactura);
    return http.post(api, tipoFactura).then((x: { data: { content: TipoItbis } }) => x.data.content)
}