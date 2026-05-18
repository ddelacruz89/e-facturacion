import apiClient from "../services/apiClient";
import { InAlmacen } from "../models/inventario/inAlmacen";

const api = "/api/v1/inventario/almacenes";

// ── request DTO ───────────────────────────────────────────────────────────────

export interface InAlmacenRequestDTO {
    nombre: string;
    ubicacion?: string;
    /** Sucursal seleccionada en el frontend; empresa va implícita en el token. */
    sucursalId: number;
}

// ── search ────────────────────────────────────────────────────────────────────

export interface InAlmacenSearchCriteria {
    nombre?: string;
    estadoId?: string;
    sucursalId?: number;
}

export interface InAlmacenResumenDTO {
    id: number;
    nombre: string;
    ubicacion?: string;
    sucursalId?: number;
    sucursalNombre?: string;
    estadoId: string;
    usuarioReg: string;
}

// ── endpoints ─────────────────────────────────────────────────────────────────

/** Solo activos de la sucursal del token. */
export function getAlmacenesActivos(): Promise<InAlmacen[]> {
    return apiClient.get(api).then((x: { data: InAlmacen[] }) => x.data);
}

/** Activos e inactivos de la sucursal del token. */
export function getAlmacenes(): Promise<InAlmacen[]> {
    return apiClient.get(`${api}/all`).then((x: { data: InAlmacen[] }) => x.data);
}

export function getAlmacen(id: number): Promise<InAlmacen> {
    return apiClient.get(`${api}/${id}`).then((x: { data: InAlmacen }) => x.data);
}

/** Crea un almacén. La sucursal se envía desde el frontend. */
export function saveAlmacen(data: InAlmacenRequestDTO): Promise<InAlmacen> {
    return apiClient.post(api, data).then((x: { data: InAlmacen }) => x.data);
}

/** Actualiza un almacén. La sucursal puede cambiar. */
export function updateAlmacen(id: number, data: InAlmacenRequestDTO): Promise<InAlmacen> {
    return apiClient.put(`${api}/${id}`, data).then((x: { data: InAlmacen }) => x.data);
}

/** Desactiva (INA). */
export function disableAlmacen(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

/** Reactiva (ACT). */
export function enableAlmacen(id: number): Promise<void> {
    return apiClient.patch(`${api}/${id}/activar`);
}

/** Búsqueda cross-sucursal dentro de la empresa. */
export function buscarAlmacenes(criteria: InAlmacenSearchCriteria): Promise<InAlmacenResumenDTO[]> {
    return apiClient
        .post(`${api}/buscar`, criteria)
        .then((x: { data: InAlmacenResumenDTO[] }) => x.data);
}

// Alias backward-compat
export const deleteAlmacen = disableAlmacen;
