import apiClient from "../services/apiClient";
import searchService from "../services/searchService";
import { searchByQuery, searchById, getAll, searchByParent } from "../utils/searchUtils";
import { MgProducto } from "../models/producto";

const api = "/api/producto";

// Using the new search service - these are examples of different approaches
export function getProductos(): Promise<MgProducto[]> {
    return getAll<MgProducto[]>(api);
}

export function getProducto(id: number): Promise<MgProducto> {
    return searchById<MgProducto>(api, id);
}

export function getProductosByCategoria(categoriaId: string): Promise<MgProducto[]> {
    return searchByParent<MgProducto[]>(api, "categoria", categoriaId);
}

export function searchProductos(query: string): Promise<MgProducto[]> {
    return searchByQuery<MgProducto[]>(`${api}/search`, query);
}

// Additional search functions using the new search service
export function searchProductosAdvanced(filters: {
    q?: string;
    categoria?: string;
    precio_min?: number;
    precio_max?: number;
    estado?: string;
}): Promise<MgProducto[]> {
    return searchService.search<MgProducto[]>({
        url: `${api}/search/advanced`,
        params: filters,
    });
}

export function getProductosPaginated(
    page: number = 0,
    size: number = 10
): Promise<{
    content: MgProducto[];
    totalElements: number;
    totalPages: number;
}> {
    return searchService.search({
        url: `${api}/paginated`,
        params: { page, size },
    });
}

export function saveProducto(producto: MgProducto): Promise<MgProducto> {
    console.log("saveProducto", producto);
    // Siempre usa POST, el backend determina si es crear o actualizar basado en el ID
    return apiClient.post(api, producto).then((x: { data: MgProducto }) => x.data);
}

export function updateProducto(id: number, producto: MgProducto): Promise<MgProducto> {
    return apiClient.put(`${api}/${id}`, producto).then((x: { data: MgProducto }) => x.data);
}

export function deleteProducto(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}
