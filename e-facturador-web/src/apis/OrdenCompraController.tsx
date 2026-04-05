import apiClient from "../services/apiClient";
import searchService from "../services/searchService";
import { searchByQuery, searchById, getAll } from "../utils/searchUtils";
import { InOrdenCompra, InOrdenCompraFormDTO, InOrdenCompraSimpleDTO } from "../models/inventario";

const api = "/api/v1/inventario/ordenes-compras";

// Get all ordenes de compra
export function getOrdenesCompra(): Promise<InOrdenCompra[]> {
    return getAll<InOrdenCompra[]>(api);
}

// Get single orden de compra by ID
export function getOrdenCompra(id: number): Promise<InOrdenCompra> {
    return searchById<InOrdenCompra>(api, id);
}

// Search ordenes de compra by query
export function searchOrdenesCompra(query: string): Promise<InOrdenCompra[]> {
    return searchByQuery<InOrdenCompra[]>(`${api}/search`, query);
}

// Advanced search with filters
export function searchOrdenesCompraAdvanced(filters: {
    q?: string;
    suplidorId?: number;
    estadoId?: string;
    cotizacionId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
}): Promise<InOrdenCompra[]> {
    return searchService.search<InOrdenCompra[]>({
        url: `${api}/search/advanced`,
        params: filters,
    });
}

// Get paginated ordenes de compra
export function getOrdenesCompraPaginated(
    page: number = 0,
    size: number = 10,
): Promise<{
    content: InOrdenCompra[];
    totalElements: number;
    totalPages: number;
}> {
    return searchService.search({
        url: `${api}/paginated`,
        params: { page, size },
    });
}

// Get simple orden compra resumen (DTO)
export function getOrdenesCompraResumen(): Promise<InOrdenCompraSimpleDTO[]> {
    return apiClient.get(`${api}/resumen`).then((x: { data: InOrdenCompraSimpleDTO[] }) => x.data);
}

const normalizeOrdenCompraPayload = (ordenCompra: InOrdenCompraFormDTO): InOrdenCompraFormDTO => ({
    ...ordenCompra,
    suplidorId:
        typeof (ordenCompra as any)?.suplidorId === "object" && (ordenCompra as any)?.suplidorId !== null
            ? (ordenCompra as any).suplidorId.id
            : ordenCompra.suplidorId,
    detalles: ordenCompra.detalles?.map((detalle) => ({
        ...detalle,
        productoId:
            typeof detalle?.productoId === "object" && detalle?.productoId !== null ? detalle.productoId.id : detalle?.productoId,
    })),
});

// Save (create or update) orden de compra
export function saveOrdenCompra(ordenCompra: InOrdenCompraFormDTO): Promise<InOrdenCompra> {
    console.log("saveOrdenCompra", ordenCompra);
    // Always use POST, backend determines create/update based on ID
    return apiClient.post(api, normalizeOrdenCompraPayload(ordenCompra)).then((x: { data: InOrdenCompra }) => x.data);
}

// Update orden de compra
export function updateOrdenCompra(id: number, ordenCompra: InOrdenCompraFormDTO): Promise<InOrdenCompra> {
    return apiClient.put(`${api}/${id}`, normalizeOrdenCompraPayload(ordenCompra)).then((x: { data: InOrdenCompra }) => x.data);
}

// Delete orden de compra
export function deleteOrdenCompra(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

// Get ordenes de compra by suplidor
export function getOrdenesCompraBySuplidor(suplidorId: number): Promise<InOrdenCompra[]> {
    return apiClient.get(`${api}/suplidor/${suplidorId}`).then((x: { data: InOrdenCompra[] }) => x.data);
}

// Get ordenes de compra by cotizacion
export function getOrdenesCompraByCotizacion(cotizacionId: number): Promise<InOrdenCompra[]> {
    return apiClient.get(`${api}/cotizacion/${cotizacionId}`).then((x: { data: InOrdenCompra[] }) => x.data);
}

// Get ordenes de compra by estado
export function getOrdenesCompraByEstado(estadoId: string): Promise<InOrdenCompra[]> {
    return apiClient.get(`${api}/estado/${estadoId}`).then((x: { data: InOrdenCompra[] }) => x.data);
}

// Approve orden de compra
export function approveOrdenCompra(id: number): Promise<InOrdenCompra> {
    return apiClient.put(`${api}/${id}/aprobar`).then((x: { data: InOrdenCompra }) => x.data);
}

// Cancel orden de compra
export function cancelOrdenCompra(id: number): Promise<InOrdenCompra> {
    return apiClient.put(`${api}/${id}/cancelar`).then((x: { data: InOrdenCompra }) => x.data);
}
