import apiClient from "../services/apiClient";
import { Cliente } from "../models/cliente/Cliente"
import { DataNotFound } from "../models/ServerErros";
import { PagesResult } from "../models/PageResults";

var api = "api/v1/clientes"

export function getClientes(page: number, size: number): Promise<PagesResult<Cliente[]> | null> {
    return apiClient
        .get(`${api}/${page}/${size}`)
        .then((x: { data: PagesResult<Cliente[]> }) => x.data).catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return null;
        });
}

export function saveCliente(cliente: Cliente): Promise<Cliente | null> {
    return apiClient
        .post(`${api}`, cliente)
        .then((x: { data: Cliente }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return null;
        });
}
