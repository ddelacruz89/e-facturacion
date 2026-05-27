import apiClient from "../services/apiClient";

const BASE = "/api/v1/inventario/reportes";

export interface InReportesCriteria {
    fechaInicio?: string;   // "YYYY-MM-DD"
    fechaFin?: string;
    productoId?: number;
    sucursalId?: number | null;
    anio?: number;
    top?: number;
}

export interface InVentasComparativoDTO {
    mes: number;
    unidadesActual: number;
    unidadesAnterior: number;
    costoActual: number;
    costoAnterior: number;
}

export interface InTopProductoDTO {
    productoId: number;
    productoNombre: string;
    unidades: number;
    costoTotal: number;
}

export interface InVentasSemanaDTO {
    semana: number;
    anio: number;
    unidades: number;
    costoTotal: number;
}

export interface InVentasSucursalDTO {
    sucursalId: number;
    sucursalNombre: string;
    unidades: number;
    costoTotal: number;
}

export interface InVentasMesDTO {
    mes: number;
    anio: number;
    unidades: number;
    costoTotal: number;
}

export async function getComparativoAnual(
    criteria: InReportesCriteria
): Promise<InVentasComparativoDTO[]> {
    const res = await apiClient.post(`${BASE}/comparativo-anual`, criteria);
    return res.data;
}

export async function getTopProductos(
    criteria: InReportesCriteria
): Promise<InTopProductoDTO[]> {
    const res = await apiClient.post(`${BASE}/top-productos`, criteria);
    return res.data;
}

export async function getVentasPorSemana(
    criteria: InReportesCriteria
): Promise<InVentasSemanaDTO[]> {
    const res = await apiClient.post(`${BASE}/por-semana`, criteria);
    return res.data;
}

export async function getVentasPorSucursal(
    criteria: InReportesCriteria
): Promise<InVentasSucursalDTO[]> {
    const res = await apiClient.post(`${BASE}/por-sucursal`, criteria);
    return res.data;
}

export async function getHistoricoProducto(
    criteria: InReportesCriteria
): Promise<InVentasMesDTO[]> {
    const res = await apiClient.post(`${BASE}/historico-producto`, criteria);
    return res.data;
}
