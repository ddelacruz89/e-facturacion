import apiClient from "../services/apiClient";

const BASE = "/api/v1/dashboard";

export interface DashboardTendenciaDTO {
    dia: string;
    total: number;
}

export interface DashboardKpiDTO {
    modulo: string;
    titulo: string;
    total: number;
    labelTotal: string;
    pendientes: number | null;
    labelPendientes: string | null;
    completadas: number | null;
    labelCompletadas: string | null;
    tendencia: DashboardTendenciaDTO[];
}

export interface DashboardSucursalDTO {
    id: number;
    nombre: string;
}

export interface DashboardAjusteBarDTO {
    tipoId: number;
    tipoNombre: string;
    total: number;
}

/** Retorna los KPIs del dashboard. Si sucursalId es undefined, trae datos de toda la empresa. */
export async function getDashboardKpis(sucursalId?: number): Promise<DashboardKpiDTO[]> {
    const params = sucursalId !== undefined ? { sucursalId } : {};
    const res = await apiClient.get(`${BASE}/kpis`, { params });
    return res.data;
}

/** Retorna las sucursales a las que el usuario tiene acceso (para el selector del dashboard). */
export async function getDashboardSucursales(): Promise<DashboardSucursalDTO[]> {
    const res = await apiClient.get(`${BASE}/sucursales`);
    return res.data;
}

/** Conteo de ajustes de inventario por tipo (últimos 7 días). */
export async function getDashboardAjustes(sucursalId?: number): Promise<DashboardAjusteBarDTO[]> {
    const params = sucursalId !== undefined ? { sucursalId } : {};
    const res = await apiClient.get(`${BASE}/ajustes`, { params });
    return res.data;
}
