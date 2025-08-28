import http from 'axios'
import { SgUsuario } from '../models/seguridad';

var api = "api/seguridad/usuario";
export function getUsuario(): Promise<SgUsuario> {
    return http.get(api).then((x: { data: { content: SgUsuario } }) => x.data.content)
}
export function saveUsuario(usuario: SgUsuario): Promise<SgUsuario> {
    console.log("saveUsuario", usuario);
    return http.post(api, usuario).then((x: { data: { content: SgUsuario } }) => x.data.content)
}