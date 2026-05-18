import apiClient from "../services/apiClient";
import { InTransferencia, InTransferenciaRequestDTO } from "../models/inventario/transferencia";

const api = "/api/v1/inventario/transferencias";

export function getTransferencias(): Promise<InTransferencia[]> {
    return apiClient.get(api).then((x: { data: { content: InTransferencia[] } }) => x.data.content ?? x.data);
}

export function getTransferencia(id: number): Promise<InTransferencia> {
    return apiClient.get(`${api}/${id}`).then((x: { data: { content: InTransferencia } }) => x.data.content ?? x.data);
}

export function createTransferencia(data: InTransferenciaRequestDTO): Promise<InTransferencia> {
    return apiClient.post(api, data).then((x: { data: { content: InTransferencia } }) => x.data.content ?? x.data);
}

export function updateTransferencia(id: number, data: InTransferenciaRequestDTO): Promise<InTransferencia> {
    return apiClient.put(`${api}/${id}`, data).then((x: { data: { content: InTransferencia } }) => x.data.content ?? x.data);
}

export function anularTransferencia(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

export function getStockProductoEnAlmacen(
    productoId: number,
    almacenId: number
): Promise<{ productoId: number; almacenId: number; cantidad: number }> {
    return apiClient
        .get(`${api}/stock`, { params: { productoId, almacenId } })
        .then((x: { data: { content: { productoId: number; almacenId: number; cantidad: number } } }) => x.data.content ?? x.data);
}

export interface InLoteStockItem {
    lote: string | null;  // null = sin lote asignado
    cantidad: number;
}

export interface InProductoLotesStock {
    totalDisponible: number;
    lotes: InLoteStockItem[];
    /** Cuantas unidades-fraccion por unidad-base (ej: 10 si Caja x 10 Und). null = no configurado. */
    cantidadUnidad: number | null;
    /** Nombre de la unidad base, ej: "Caja". null si no configurado. */
    unidadNombre: string | null;
    /** Sigla de la unidad base, ej: "Cja". */
    unidadSigla: string | null;
    /** Nombre de la unidad de fraccion, ej: "Unidad". */
    unidadFraccionNombre: string | null;
    /** Sigla de la unidad de fraccion, ej: "Und". */
    unidadFraccionSigla: string | null;
    /** true cuando cantidadUnidad > 1. */
    esFraccionario: boolean;
}

/** Stock de un producto en un almacen desglosado por lote, con info de unidad. */
export function getLotesConStockEnAlmacen(
    productoId: number,
    almacenId: number
): Promise<InProductoLotesStock> {
    return apiClient
        .get(`${api}/lotes-stock`, { params: { productoId, almacenId } })
        .then((x: { data: InProductoLotesStock }) => x.data);
}
