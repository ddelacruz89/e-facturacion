import apiClient from "../services/apiClient";
import { McCuenta, McCuentaNodoDTO, McCuentaRequestDTO } from "../models/contabilidad/McCuenta";

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
export function buscarRaices(page: number, size: number): Promise<PageResponse<McCuentaNodoDTO>> {
    return apiClient
        .get(`${api}/raices`, { params: { page, size } })
        .then((x: { data: PageResponse<McCuentaNodoDTO> }) => x.data);
}

/** Hijos directos de una cuenta — se llama al expandir una fila. */
export function buscarHijos(padreId: number): Promise<McCuentaNodoDTO[]> {
    return apiClient
        .get(`${api}/${padreId}/hijos`)
        .then((x: { data: McCuentaNodoDTO[] }) => x.data);
}

/** Objeto completo para editar. */
export function getCuenta(id: number): Promise<McCuenta> {
    return apiClient.get(`${api}/${id}`).then((x: { data: McCuenta }) => x.data);
}

export function crearCuenta(data: McCuentaRequestDTO): Promise<McCuenta> {
    return apiClient.post(api, data).then((x: { data: McCuenta }) => x.data);
}

export function actualizarCuenta(id: number, data: McCuentaRequestDTO): Promise<McCuenta> {
    return apiClient.put(`${api}/${id}`, data).then((x: { data: McCuenta }) => x.data);
}

/** Desactiva (INA). */
export function desactivarCuenta(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

/** Reactiva (ACT). */
export function activarCuenta(id: number): Promise<void> {
    return apiClient.patch(`${api}/${id}/activar`);
}
