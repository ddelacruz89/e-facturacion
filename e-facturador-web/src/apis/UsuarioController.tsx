import apiClient from "../services/apiClient";
import { SgUsuario } from "../models/seguridad";

var api = "api/seguridad/usuario";
export function getUsuario(): Promise<SgUsuario> {
    return apiClient.get(api).then((x: { data: { content: SgUsuario } }) => x.data.content);
}
export function saveUsuario(usuario: SgUsuario): Promise<SgUsuario> {
    console.log("saveUsuario", usuario);
    return apiClient.post(api, usuario).then((x: { data: { content: SgUsuario } }) => x.data.content);
}
