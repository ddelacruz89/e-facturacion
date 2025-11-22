import apiClient from "../services/apiClient";
import { SgMenu, SgMenuResumenDTO } from "../models/seguridad";

const api = "/api/v1/seguridad/menu";

export function getMenus(): Promise<SgMenu[]> {
    return apiClient.get(api.concat("/all")).then((x: { data: SgMenu[] }) => x.data);
}

export function getMenu(id: number): Promise<SgMenu> {
    return apiClient.get(`${api}/${id}`).then((x: { data: SgMenu }) => x.data);
}

export function getMenusActivos(): Promise<SgMenu[]> {
    return apiClient.get(`${api}/activos`).then((x: { data: SgMenu[] }) => x.data);
}

export function getMenusAsignablesAProductos(): Promise<SgMenuResumenDTO[]> {
    return apiClient.get(`${api}/asignables-productos`).then((x: { data: SgMenuResumenDTO[] }) => x.data);
}

export function saveMenu(menu: SgMenu): Promise<SgMenu> {
    return apiClient.post(api, menu).then((x: { data: SgMenu }) => x.data);
}

export function updateMenu(id: number, menu: SgMenu): Promise<SgMenu> {
    return apiClient.put(`${api}/${id}`, menu).then((x: { data: SgMenu }) => x.data);
}

export function deleteMenu(id: number): Promise<void> {
    return apiClient.delete(`${api}/${id}`);
}
