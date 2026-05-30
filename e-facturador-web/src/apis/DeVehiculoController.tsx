import apiClient from "../services/apiClient";
import { DeVehiculo } from "../models/despacho/DespachoModels";

const BASE_URL = "/api/v1/despacho/vehiculos";

function unwrapContent<T>(data: any): T {
    return data?.content !== undefined ? data.content : data;
}

export function getVehiculos(): Promise<DeVehiculo[]> {
    return apiClient.get(BASE_URL).then((x) => unwrapContent<DeVehiculo[]>(x.data));
}

export function getVehiculosActivos(): Promise<DeVehiculo[]> {
    return apiClient.get(`${BASE_URL}/activos`).then((x) => unwrapContent<DeVehiculo[]>(x.data));
}

export function getVehiculo(id: number): Promise<DeVehiculo> {
    return apiClient.get(`${BASE_URL}/${id}`).then((x) => unwrapContent<DeVehiculo>(x.data));
}

export function saveVehiculo(vehiculo: DeVehiculo): Promise<DeVehiculo> {
    return apiClient.post(BASE_URL, vehiculo).then((x) => unwrapContent<DeVehiculo>(x.data));
}

export function updateVehiculo(id: number, vehiculo: DeVehiculo): Promise<DeVehiculo> {
    return apiClient.put(`${BASE_URL}/${id}`, vehiculo).then((x) => unwrapContent<DeVehiculo>(x.data));
}

export function disableVehiculo(id: number): Promise<void> {
    return apiClient.delete(`${BASE_URL}/${id}`).then(() => undefined);
}
