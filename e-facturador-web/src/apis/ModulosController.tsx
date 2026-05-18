import apiClient from "../services/apiClient";
import { ModuloDto } from "../models/seguridad";

var api = "api/seguridad/modulo";

export function getModulos(): Promise<ModuloDto[]> {
    return apiClient.get(api.concat("/permitidos")).then((x: { data: { content: ModuloDto[] } }) => x.data.content);
}

/** Todos los módulos sin filtrar por permisos — para gestión de roles. */
export function getTodosModulos(): Promise<ModuloDto[]> {
    return apiClient.get(api.concat("/todos")).then((x: { data: { content: ModuloDto[] } }) => x.data.content);
}
