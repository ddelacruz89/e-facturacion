import apiClient from "../services/apiClient";

const BASE = "/api/v1/inventario/stock-arbol";

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface InStockArbolSearchCriteria {
    /** null = todas las sucursales de la empresa */
    sucursalId?: number | null;
    /** Filtro de almacén (solo aplica en nivel 1) */
    almacenId?: number | null;
    productoNombre?: string;
    soloConStock?: boolean;
    /** Página a consultar (0-based). Solo nivel 1. */
    page?: number;
    /** Tamaño de página calculado por el frontend según la altura de pantalla. */
    size?: number;
}

/** Respuesta paginada de Spring Data. */
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/** Nivel 3: lote con cantidad */
export interface InStockLoteNodoDTO {
    lote: string | null;
    cantidad: number;
}

/** Nivel 2: almacén con cantidad total. lotes se carga lazy al expandir. */
export interface InStockAlmacenNodoDTO {
    almacenId: number;
    almacenNombre: string;
    totalCantidad: number;
    /** "BAJO" | "SALUDABLE" | null (sin límite configurado) */
    estadoStock?: string | null;
}

/** Nivel 1: producto con cantidad total. almacenes se carga lazy al expandir. */
export interface InStockProductoNodoDTO {
    productoId: number;
    productoNombre: string;
    totalCantidad: number;
    /** "BAJO" si al menos un almacén está bajo su límite; "SALUDABLE" si todos bien; null = sin límite */
    estadoStock?: string | null;
}

/** Producto-almacén con stock por debajo del límite configurado. */
export interface InStockCriticoDTO {
    productoId: number;
    productoNombre: string;
    almacenId: number;
    almacenNombre: string;
    cantidadActual: number;
    limite: number;
    faltante: number;
}

// ── API ───────────────────────────────────────────────────────────────────

/** Nivel 1: página de productos con cantidad total. */
export function buscarStockProductos(
    criteria: InStockArbolSearchCriteria
): Promise<PageResponse<InStockProductoNodoDTO>> {
    return apiClient
        .post<PageResponse<InStockProductoNodoDTO>>(`${BASE}/buscar`, criteria)
        .then((res) => res.data);
}

/** Nivel 2: almacenes de un producto concreto. */
export function buscarAlmacenesPorProducto(
    productoId: number,
    criteria: InStockArbolSearchCriteria
): Promise<InStockAlmacenNodoDTO[]> {
    return apiClient
        .post<InStockAlmacenNodoDTO[]>(`${BASE}/producto/${productoId}/almacenes`, criteria)
        .then((res) => res.data);
}

/** Lista plana de productos bajo su límite mínimo de stock. */
export function getStockCritico(): Promise<InStockCriticoDTO[]> {
    return apiClient
        .get<InStockCriticoDTO[]>(`${BASE}/stock-critico`)
        .then((res) => res.data);
}

/** Nivel 3: lotes de un producto en un almacén concreto. */
export function buscarLotesPorProductoAlmacen(
    productoId: number,
    almacenId: number,
    criteria: InStockArbolSearchCriteria
): Promise<InStockLoteNodoDTO[]> {
    return apiClient
        .post<InStockLoteNodoDTO[]>(
            `${BASE}/producto/${productoId}/almacen/${almacenId}/lotes`,
            criteria
        )
        .then((res) => res.data);
}
