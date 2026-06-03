import apiClient from "../services/apiClient";

const BASE = "/api/v1/despacho/precios-envio";

interface ApiResponse<T> {
  status?: string;
  content?: T;
}

function unwrapContent<T>(data: ApiResponse<T> | T): T {
  return (data as ApiResponse<T>)?.content !== undefined
    ? ((data as ApiResponse<T>).content as T)
    : (data as T);
}

export interface DePrecioEnvioDTO {
  id: number | null;
  barrioId: number;
  barrioNombre: string;
  subBarrioId: number | null;
  subBarrioNombre: string | null;
  precio: number;
}

export function getPreciosPorMunicipio(municipioId: number): Promise<DePrecioEnvioDTO[]> {
  return apiClient
    .get(`${BASE}/por-municipio/${municipioId}`)
    .then((x: { data: ApiResponse<DePrecioEnvioDTO[]> }) => unwrapContent(x.data));
}

export function getPreciosPorBarrio(barrioId: number): Promise<DePrecioEnvioDTO[]> {
  return apiClient
    .get(`${BASE}/por-barrio/${barrioId}`)
    .then((x: { data: ApiResponse<DePrecioEnvioDTO[]> }) => unwrapContent(x.data));
}

export function upsertPrecioBarrio(barrioId: number, precio: number): Promise<DePrecioEnvioDTO> {
  return apiClient
    .put(`${BASE}/barrio/${barrioId}`, { precio })
    .then((x: { data: ApiResponse<DePrecioEnvioDTO> }) => unwrapContent(x.data));
}

export function upsertPrecioSubBarrio(
  subBarrioId: number,
  precio: number
): Promise<DePrecioEnvioDTO> {
  return apiClient
    .put(`${BASE}/sub-barrio/${subBarrioId}`, { precio })
    .then((x: { data: ApiResponse<DePrecioEnvioDTO> }) => unwrapContent(x.data));
}

export function deletePrecioBarrio(barrioId: number): Promise<void> {
  return apiClient.delete(`${BASE}/barrio/${barrioId}`).then(() => undefined);
}

export function deletePrecioSubBarrio(subBarrioId: number): Promise<void> {
  return apiClient.delete(`${BASE}/sub-barrio/${subBarrioId}`).then(() => undefined);
}
