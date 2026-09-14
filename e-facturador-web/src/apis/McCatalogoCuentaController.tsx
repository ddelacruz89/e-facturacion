import apiClient from "../services/apiClient";
import { McCatalogoCuenta, McCatalogoCuentaNodoDTO, McCatalogoCuentaRequestDTO, McCatalogoCuentaSugerenciaDTO } from "../models/contabilidad/McCatalogoCuenta";

const api = "/api/v1/contabilidad/cuentas";

// ── paginación ────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// ── endpoints ─────────────────────────────────────────────────────────────────

/** Nivel 1: cuentas raíz (sin padre), paginadas. */
export function buscarRaices(page: number, size: number): Promise<PageResponse<McCatalogoCuentaNodoDTO>> {
    return apiClient
        .get(`${api}/raices`, { params: { page, size } })
        .then((x: { data: PageResponse<McCatalogoCuentaNodoDTO> }) => x.data);
}

/** Hijos directos de una cuenta — se llama al expandir una fila. */
export function buscarHijos(padreId: number): Promise<McCatalogoCuentaNodoDTO[]> {
    return apiClient
        .get(`${api}/${padreId}/hijos`)
        .then((x: { data: McCatalogoCuentaNodoDTO[] }) => x.data);
}

/** Sugiere el código de la próxima sub-cuenta a crear bajo padreId. */
export function sugerirSubcuenta(padreId: number): Promise<McCatalogoCuentaSugerenciaDTO> {
    return apiClient
        .get(`${api}/${padreId}/sugerencia`)
        .then((x: { data: McCatalogoCuentaSugerenciaDTO }) => x.data);
}

/** Objeto completo para editar. */
export function getCuenta(id: number): Promise<McCatalogoCuenta> {
    return apiClient.get(`${api}/${id}`).then((x: { data: McCatalogoCuenta }) => x.data);
}

export function crearCuenta(data: McCatalogoCuentaRequestDTO): Promise<McCatalogoCuenta> {
    return apiClient.post(api, data).then((x: { data: McCatalogoCuenta }) => x.data);
}

export function actualizarCuenta(id: number, data: McCatalogoCuentaRequestDTO): Promise<McCatalogoCuenta> {
    return apiClient.put(`${api}/${id}`, data).then((x: { data: McCatalogoCuenta }) => x.data);
}

/** Desactiva (INA). */
export function desactivarCuenta(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

/** Reactiva (ACT). */
export function activarCuenta(id: number): Promise<void> {
    return apiClient.patch(`${api}/${id}/activar`);
}
