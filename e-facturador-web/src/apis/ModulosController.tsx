

import http from 'axios'
import { ModuloDto } from '../models/seguridad';

var api = "api/seguridad/modulo";
export function getModulos(): Promise<ModuloDto[]> {
    return http.get(api.concat("/permitidos")).then((x: { data: { content: ModuloDto[] } }) => x.data.content)
}
