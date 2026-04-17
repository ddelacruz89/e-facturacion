import apiClient from "../services/apiClient";
import { ProductoVenta } from "../models/producto/productoVenta";
import { Factura, IFacturaResumen } from "../models/facturacion";
import { PagesResult } from "../models/PageResults";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/facturacion/facturas";
export function getProductosVentas(): Promise<ProductoVenta[]> {
    return apiClient.get(`${api}/productos/ventas`).then((response) => response.data);
}

export function saveFactura(factura: Factura): Promise<Factura> {
    return apiClient.post(`${api}`, factura).then((response) => response.data);
}

export function getFacturaById(id: number): Promise<Factura | null> {
    return apiClient
        .get(`${api}/${id}`)
        .then((x: { data: Factura }) => x.data).catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return null;
        });
}

export function getFacturas(page: number, size: number): Promise<PagesResult<IFacturaResumen[]> | null> {
    return apiClient
        .get(`${api}/${page}/${size}`)
        .then((x: { data: PagesResult<IFacturaResumen[]> }) => x.data).catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return null;
        });
}
