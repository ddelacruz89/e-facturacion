import apiClient from "../services/apiClient";

const BASE = "/api/v1/inventario/ajustes";

export interface InAjusteDetalleRequest {
    productoId: number;
    lote?: string;
    cantidadActual: number;
    cantidadNueva: number;
}

export interface InAjusteInventarioRequest {
    almacenId: number;
    movimientoTipoId: number;
    observacion?: string;
    detalles: InAjusteDetalleRequest[];
}

export interface InAjusteInventarioResumenDTO {
    id: number;
    fechaReg: string;
    almacenId: number;
    estadoId: string;
    movimientoTipoNombre: string;
    observacion: string;
    usuarioReg: string;
    totalLineas: number;
}

export interface InAjusteInventarioSearchCriteria {
    fechaInicio?: string;
    fechaFin?: string;
    usuarioReg?: string;
    estadoId?: string;
    movimientoTipoId?: number;
    page?: number;
    size?: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface InAjusteInventarioDetalle {
    id: number;
    productoId: number;
    lote?: string;
    cantidadActual: number;
    cantidadNueva: number;
    diferencia: number;
}

export interface InAjusteInventario {
    id: number;
    fechaReg: string;
    almacenId: number;
    estadoId: string;
    observacion: string;
    usuarioReg: string;
    detalles: InAjusteInventarioDetalle[];
}

export interface InStockActualDTO {
    productoId: number;
    productoNombre: string;
    almacenId: number;
    lote?: string;
    cantidad: number;
}

export async function aplicarAjuste(request: InAjusteInventarioRequest): Promise<InAjusteInventario> {
    const res = await apiClient.post(`${BASE}/aplicar`, request);
    return res.data;
}

export async function buscarAjustes(criteria: InAjusteInventarioSearchCriteria): Promise<PageResponse<InAjusteInventarioResumenDTO>> {
    const res = await apiClient.post(`${BASE}/buscar`, criteria);
    return res.data;
}

export async function getAjuste(id: number): Promise<InAjusteInventario> {
    const res = await apiClient.get(`${BASE}/${id}`);
    return res.data;
}

export async function getHistorialAjustes(almacenId: number): Promise<InAjusteInventarioResumenDTO[]> {
    const res = await apiClient.get(`${BASE}/historial`, { params: { almacenId } });
    return res.data;
}

export async function getStockActual(productoId: number, almacenId: number, lote?: string): Promise<InStockActualDTO> {
    const res = await apiClient.get(`${BASE}/stock`, {
        params: { productoId, almacenId, lote: lote || undefined },
    });
    return res.data;
}

export async function getLotesDisponibles(productoId: number, almacenId: number): Promise<(string | null)[]> {
    const res = await apiClient.get(`${BASE}/lotes`, { params: { productoId, almacenId } });
    return res.data;
}
