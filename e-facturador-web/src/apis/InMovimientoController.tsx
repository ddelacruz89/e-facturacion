import apiClient from "../services/apiClient";

const BASE = "/api/v1/inventario/movimientos";

export interface InMovimientoSearchCriteria {
    fechaInicio?: string;   // ISO date "YYYY-MM-DD"
    fechaFin?: string;
    sucursalId?: number | null; // null = todas las sucursales
    almacenId?: number;
    productoId?: number;
    tipoMovimientoId?: number;
    numeroReferencia?: number;
    lote?: string;
    page?: number;
    size?: number;
}

export interface InMovimientoResumenDTO {
    id: number;
    fechaReg: string;
    tipoMovimientoId: number;
    tipoMovimientoNombre?: string;
    numeroReferencia?: number;
    almacenId: number;
    almacenNombre?: string;
    productoId: number;
    productoNombre?: string;
    lote?: string;
    cantidad: number;
    cantidadInventario?: number;
    precioUnitario?: number;
    costoTotal?: number;
    usuarioReg: string;
    observacion?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export async function buscarMovimientos(
    criteria: InMovimientoSearchCriteria
): Promise<PageResponse<InMovimientoResumenDTO>> {
    const res = await apiClient.post(`${BASE}/buscar`, criteria);
    return res.data;
}

export async function getMovimiento(id: number) {
    const res = await apiClient.get(`${BASE}/${id}`);
    return res.data;
}

export async function getHistorialProductoAlmacen(
    productoId: number,
    almacenId: number
): Promise<InMovimientoResumenDTO[]> {
    const res = await apiClient.get(`${BASE}/historial`, {
        params: { productoId, almacenId },
    });
    return res.data;
}
