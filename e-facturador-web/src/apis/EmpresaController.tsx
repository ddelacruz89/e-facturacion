import apiClient from "../services/apiClient";
import { SgEmpresa } from "../models/seguridad";

var api = "/api/seguridad/empresa";
export function getEmpresa(): Promise<SgEmpresa> {
    return apiClient.get(api).then((x: { data: { content: SgEmpresa } }) => x.data.content);
}
export function saveEmpresa(factura: SgEmpresa): Promise<SgEmpresa> {
    return apiClient.post(api, factura).then((x: { data: { content: SgEmpresa } }) => x.data.content);
}
