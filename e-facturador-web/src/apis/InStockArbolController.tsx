import apiClient from "../services/apiClient";

const BASE = "/api/v1/inventario/stock-arbol";

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface InStockArbolSearchCriteria {
    /** null = todas las sucursales de la empresa */
    sucursalId?: number | null;
    almacenId?: number | null;
    productoNombre?: string;
    soloConStock?: boolean;
}

export interface InStockLoteNodoDTO {
    lote: string | null;
    cantidad: number;
}

export interface InStockAlmacenNodoDTO {
    almacenId: number;
    almacenNombre: string;
    totalCantidad: number;
    lotes: InStockLoteNodoDTO[];
}

export interface InStockProductoNodoDTO {
    productoId: number;
    productoNombre: string;
    totalCantidad: number;
    almacenes: InStockAlmacenNodoDTO[];
}

// ── API ───────────────────────────────────────────────────────────────────

export function buscarStockArbol(
    criteria: InStockArbolSearchCriteria
): Promise<InStockProductoNodoDTO[]> {
    return apiClient
        .post<InStockProductoNodoDTO[]>(`${BASE}/buscar`, criteria)
        .then((res: { data: InStockProductoNodoDTO[] }) => res.data);
}
