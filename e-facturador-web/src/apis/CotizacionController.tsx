import apiClient from "../services/apiClient";
import searchService from "../services/searchService";
import { searchByQuery, searchById, getAll } from "../utils/searchUtils";
import { InCotizacion, InCotizacionFormDTO, InCotizacionSimpleDTO } from "../models/inventario";

const api = "/api/inventario/cotizacion";

// Get all cotizaciones
export function getCotizaciones(): Promise<InCotizacion[]> {
    return getAll<InCotizacion[]>(api);
}

// Get single cotizacion by ID
export function getCotizacion(id: number): Promise<InCotizacion> {
    return searchById<InCotizacion>(api, id);
}

// Search cotizaciones by query
export function searchCotizaciones(query: string): Promise<InCotizacion[]> {
    return searchByQuery<InCotizacion[]>(`${api}/search`, query);
}

// Advanced search with filters
export function searchCotizacionesAdvanced(filters: {
    q?: string;
    prioridad?: string;
    descripcion?: string;
    estado?: string;
}): Promise<InCotizacion[]> {
    return searchService.search<InCotizacion[]>({
        url: `${api}/search/advanced`,
        params: filters,
    });
}

// Get paginated cotizaciones
export function getCotizacionesPaginated(
    page: number = 0,
    size: number = 10,
): Promise<{
    content: InCotizacion[];
    totalElements: number;
    totalPages: number;
}> {
    return searchService.search({
        url: `${api}/paginated`,
        params: { page, size },
    });
}

// Get simple cotizacion resumen (DTO)
export function getCotizacionesResumen(): Promise<InCotizacionSimpleDTO[]> {
    return apiClient.get(`${api}/resumen`).then((x: { data: InCotizacionSimpleDTO[] }) => x.data);
}

// Save (create or update) cotizacion
export function saveCotizacion(cotizacion: InCotizacionFormDTO): Promise<InCotizacion> {
    console.log("saveCotizacion", cotizacion);
    // Always use POST, backend determines create/update based on ID
    return apiClient.post(api, cotizacion).then((x: { data: InCotizacion }) => x.data);
}

// Update cotizacion
export function updateCotizacion(id: number, cotizacion: InCotizacionFormDTO): Promise<InCotizacion> {
    return apiClient.put(`${api}/${id}`, cotizacion).then((x: { data: InCotizacion }) => x.data);
}

// Delete cotizacion
export function deleteCotizacion(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}

// Get cotizaciones by suplidor
export function getCotizacionesBySuplidor(suplidorId: number): Promise<InCotizacion[]> {
    return apiClient.get(`${api}/suplidor/${suplidorId}`).then((x: { data: InCotizacion[] }) => x.data);
}

// Get cotizaciones by producto
export function getCotizacionesByProducto(productoId: number): Promise<InCotizacion[]> {
    return apiClient.get(`${api}/producto/${productoId}`).then((x: { data: InCotizacion[] }) => x.data);
}

// Get cotizaciones by prioridad
export function getCotizacionesByPrioridad(prioridad: string): Promise<InCotizacion[]> {
    return apiClient.get(`${api}/prioridad/${prioridad}`).then((x: { data: InCotizacion[] }) => x.data);
}
