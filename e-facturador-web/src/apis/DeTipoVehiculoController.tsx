import apiClient from "../services/apiClient";
import { DeTipoVehiculo } from "../models/despacho/DespachoModels";

const BASE_URL = "/api/v1/despacho/tipo-vehiculo";

function unwrapContent<T>(response: any): T {
    return response.data?.content !== undefined ? response.data.content : response.data;
}

export async function getTiposVehiculo(): Promise<DeTipoVehiculo[]> {
    const res = await apiClient.get(BASE_URL);
    return unwrapContent<DeTipoVehiculo[]>(res);
}

export async function getTiposVehiculoActivos(): Promise<DeTipoVehiculo[]> {
    const res = await apiClient.get(`${BASE_URL}/activos`);
    return unwrapContent<DeTipoVehiculo[]>(res);
}

export async function getTipoVehiculo(id: number): Promise<DeTipoVehiculo> {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return unwrapContent<DeTipoVehiculo>(res);
}

export async function saveTipoVehiculo(dto: DeTipoVehiculo): Promise<DeTipoVehiculo> {
    const res = await apiClient.post(BASE_URL, dto);
    return unwrapContent<DeTipoVehiculo>(res);
}

export async function updateTipoVehiculo(id: number, dto: DeTipoVehiculo): Promise<DeTipoVehiculo> {
    const res = await apiClient.put(`${BASE_URL}/${id}`, dto);
    return unwrapContent<DeTipoVehiculo>(res);
}

export async function disableTipoVehiculo(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
}
