import apiClient from "../services/apiClient";

const BASE_PROVINCIA = "/api/v1/general/provincias";
const BASE_MUNICIPIO = "/api/v1/general/municipios";
const BASE_BARRIO    = "/api/v1/general/barrios";

interface ApiResponse<T> {
  status?: string;
  content?: T;
}

function unwrapContent<T>(data: ApiResponse<T> | T): T {
  return (data as ApiResponse<T>)?.content !== undefined
    ? ((data as ApiResponse<T>).content as T)
    : (data as T);
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MgProvincia {
  codProvincia: string;
  nombre: string;
  codRegion?: string;
}

export interface MgMunicipioResumen {
  id: number;
  codOne: string;
  nombre: string;
  codProvincia: string;
  parentId: number | null;
  esDm: boolean;
}

export interface MgBarrioParajeResumen {
  id: number;
  nombre: string;
  seccionId: number;
  precioEnvio: number | null;
}

export interface MgSubBarrioResumen {
  id: number;
  codSub: string;
  nombre: string;
  barrioId: number;
}

/** Estado de una dirección de entrega */
export interface DireccionValue {
  codProvincia?: string;
  municipioId?: number;
  barrioId?: number;
  subBarrioId?: number;
  calle?: string;
  referencia?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface MgMunicipioSearchCriteria {
  codProvincia?: string;
  nombre?: string;
  esDm?: boolean;
  parentId?: number;
  page?: number;
  size?: number;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export function getProvincias(): Promise<MgProvincia[]> {
  return apiClient
    .get(BASE_PROVINCIA)
    .then((x: { data: ApiResponse<MgProvincia[]> }) =>
      unwrapContent<MgProvincia[]>(x.data)
    );
}

export function getMunicipiosByProvincia(
  codProvincia: string
): Promise<MgMunicipioResumen[]> {
  return apiClient
    .get(`${BASE_MUNICIPIO}/por-provincia/${codProvincia}`)
    .then((x: { data: ApiResponse<MgMunicipioResumen[]> }) =>
      unwrapContent<MgMunicipioResumen[]>(x.data)
    );
}

export function getBarriosByMunicipio(
  municipioId: number
): Promise<MgBarrioParajeResumen[]> {
  return apiClient
    .get(`${BASE_BARRIO}/por-municipio/${municipioId}`)
    .then((x: { data: ApiResponse<MgBarrioParajeResumen[]> }) =>
      unwrapContent<MgBarrioParajeResumen[]>(x.data)
    );
}

export function getSubBarriosByBarrio(
  barrioId: number
): Promise<MgSubBarrioResumen[]> {
  return apiClient
    .get(`${BASE_BARRIO}/${barrioId}/sub-barrios`)
    .then((x: { data: ApiResponse<MgSubBarrioResumen[]> }) =>
      unwrapContent<MgSubBarrioResumen[]>(x.data)
    );
}

export function buscarMunicipios(
  criteria: MgMunicipioSearchCriteria
): Promise<Page<MgMunicipioResumen>> {
  return apiClient
    .post(`${BASE_MUNICIPIO}/buscar`, criteria)
    .then((x: { data: ApiResponse<Page<MgMunicipioResumen>> }) =>
      unwrapContent<Page<MgMunicipioResumen>>(x.data)
    );
}

export function getMunicipio(id: number): Promise<MgMunicipioResumen> {
  return apiClient
    .get(`${BASE_MUNICIPIO}/${id}`)
    .then((x: { data: ApiResponse<MgMunicipioResumen> }) =>
      unwrapContent<MgMunicipioResumen>(x.data)
    );
}

export function getBarrio(id: number): Promise<MgBarrioParajeResumen> {
  return apiClient
    .get(`${BASE_BARRIO}/${id}`)
    .then((x: { data: ApiResponse<MgBarrioParajeResumen> }) =>
      unwrapContent<MgBarrioParajeResumen>(x.data)
    );
}
