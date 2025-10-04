import http from 'axios'
import { SgEmpresa } from '../models/seguridad';

var api = "/api/seguridad/empresa";
export function getEmpresa(): Promise<SgEmpresa> {
    return http.get(api).then((x: { data: { content: SgEmpresa } }) => x.data.content)
}
export function saveEmpresa(factura: SgEmpresa): Promise<SgEmpresa> {
    return http.post(api, factura).then((x: { data: { content: SgEmpresa } }) => x.data.content)
}
