import { MgPaquete, MgPaqueteResumenDTO, MgPaqueteSearchCriteria } from "../models/producto";

const BASE_URL = "/api/v1/producto/paquete";

export const buscarPaquetes = async (
    criteria: MgPaqueteSearchCriteria,
): Promise<MgPaqueteResumenDTO[]> => {
    const response = await fetch(`${BASE_URL}/buscar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
    });
    if (!response.ok) throw new Error("Error al buscar paquetes");
    return response.json();
};

export const getPaquete = async (id: number): Promise<MgPaquete> => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error("Error al obtener el paquete");
    return response.json();
};

export const savePaquete = async (paquete: MgPaquete): Promise<MgPaquete> => {
    const isUpdate = paquete.id && paquete.id > 0;
    const response = await fetch(isUpdate ? `${BASE_URL}/${paquete.id}` : BASE_URL, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paquete),
    });
    if (!response.ok) throw new Error("Error al guardar el paquete");
    return response.json();
};
