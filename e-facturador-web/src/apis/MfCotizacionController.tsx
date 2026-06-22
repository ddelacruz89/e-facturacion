import apiClient from "../services/apiClient";
import { PagesResult } from "../models/PageResults";
import { DataNotFound } from "../models/ServerErros";
import { Cotizacion, ICotizacionResumen } from "../models/MfContizacion";

const api = "/api/v1/facturacion/cotizaciones";

export function saveCotizacion(cotizacion: Cotizacion): Promise<Cotizacion> {
    return apiClient.post(`${api}/cotizacion`, cotizacion).then((response) => response.data);
}

export function getByNumeroCotizacion(numero: number): Promise<Cotizacion | null> {
    return apiClient
        .get(`${api}/numero/${numero}`)
        .then((x: { data: Cotizacion }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response?.data?.error;
            console.error("Mensaje:", response?.message);
            return null;
        });
}

export function getCotizaciones(page: number, size: number): Promise<PagesResult<ICotizacionResumen[]> | null> {
    return apiClient
        .get(`${api}/${page}/${size}`)
        .then((x: { data: PagesResult<ICotizacionResumen[]> }) => x.data).catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return null;
        });
}