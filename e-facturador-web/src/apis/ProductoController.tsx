import apiClient from "../services/apiClient";
import { MgProducto } from "../models/producto";

const api = "/api/producto/producto";

export function getProductos(): Promise<MgProducto[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: MgProducto[] }) => x.data);
}

export function getProducto(id: number): Promise<MgProducto> {
    return apiClient.get(`${api}/${id}`).then((x: { data: MgProducto }) => x.data);
}

export function getProductosByCategoria(categoriaId: string): Promise<MgProducto[]> {
    return apiClient.get(`${api}/categoria/${categoriaId}`).then((x: { data: MgProducto[] }) => x.data);
}

export function searchProductos(query: string): Promise<MgProducto[]> {
    return apiClient.get(`${api}/search?q=${encodeURIComponent(query)}`).then((x: { data: MgProducto[] }) => x.data);
}

export function saveProducto(producto: MgProducto): Promise<MgProducto> {
    console.log("saveProducto", producto);
    return apiClient.post(api, producto).then((x: { data: MgProducto }) => x.data);
}

export function updateProducto(id: number, producto: MgProducto): Promise<MgProducto> {
    return apiClient.put(`${api}/${id}`, producto).then((x: { data: MgProducto }) => x.data);
}

export function deleteProducto(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}
