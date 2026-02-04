import apiClient from "../services/apiClient";
import { ProductoVenta } from "../models/producto/productoVenta";
import { Factura } from "../models/facturacion";

const api = "/api/v1/facturacion/facturas";
export function getProductosVentas(): Promise<ProductoVenta[]> {
    return apiClient.get(`${api}/productos/ventas`).then((response) => response.data);
}

export function saveFactura(factura: Factura): Promise<Factura> {
    return apiClient.post(`${api}`, factura).then((response) => response.data);
}
