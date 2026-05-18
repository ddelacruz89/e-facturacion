import apiClient from "../services/apiClient";
import { InLote, InLoteUpdateDTO } from "../models/inventario";

const api = "/api/v1/inventario/lotes";

export interface InLoteSearchCriteria {
    lote?: string;
    productoId?: number;
    estadoId?: string;
    page?: number;
    size?: number;
}

export interface InLoteResumenDTO {
    lote: string;
    productoId: number;
    productoNombre: string;
    fechaVencimiento?: string | null;
    estadoId?: string;
    usuarioReg?: string;
    fechaReg?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    last: boolean;
}

/** POST /buscar — devuelve página de resumen */
export function buscarLotes(
    criteria: InLoteSearchCriteria,
): Promise<PageResponse<InLoteResumenDTO>> {
    return apiClient
        .post(`${api}/buscar`, criteria)
        .then((x: { data: PageResponse<InLoteResumenDTO> }) => x.data);
}

/** GET /{lote}/{productoId} — carga el objeto completo */
export function getLote(lote: string, productoId: number): Promise<InLote> {
    return apiClient
        .get(`${api}/${encodeURIComponent(lote)}/${productoId}`)
        .then((x: { data: InLote }) => x.data);
}

export interface InLoteStockDTO {
    almacenId: number;
    almacenNombre: string;
    cantidad: number;
}

export interface InLoteStockResponseDTO {
    /** Nombre de la unidad principal (ej. "Caja"). Null si no hay conversión. */
    unidadNombre: string | null;
    /** Nombre de la fracción (ej. "Unidad"). Null si no hay conversión. */
    fraccionNombre: string | null;
    /** Cuántas fracciones hay en una unidad (ej. 10). Siempre >= 1. */
    fraccionCantidad: number;
    /** Stock por almacén, en fracciones. */
    almacenes: InLoteStockDTO[];
}

/** GET /{lote}/{productoId}/stock — stock por almacén con conversión unidad/fracción */
export function getStockPorAlmacen(lote: string, productoId: number): Promise<InLoteStockResponseDTO> {
    return apiClient
        .get(`${api}/${encodeURIComponent(lote)}/${productoId}/stock`)
        .then((x: { data: InLoteStockResponseDTO }) => x.data);
}

/** PUT /{lote}/{productoId} — actualiza campos editables */
export function updateLote(
    lote: string,
    productoId: number,
    dto: InLoteUpdateDTO,
): Promise<InLote> {
    return apiClient
        .put(`${api}/${encodeURIComponent(lote)}/${productoId}`, dto)
        .then((x: { data: InLote }) => x.data);
}
