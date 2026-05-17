import { MgRetencion } from "../models/facturacion";
import apiClient from "../services/apiClient";

const api = "/api/v1/retencion";

export function getRetenciones(): Promise<MgRetencion[]> {
    return apiClient.get(`${api}`)
        .then((response) => {
            console.log("Retenciones:", response.data.content);
            return response.data.content
        })
        .catch((error) => {
            console.error("Error al obtener retenciones:", error);
            return [];
        });
}

export function saveRetencion(data: MgRetencion): Promise<MgRetencion> {
    if (data.id) {
        return apiClient.put(`${api}/${data.id}`, data)
            .then((response) => response.data)
            .catch((error) => {
                console.error("Error al guardar retencion:", error);
                throw error;
            });
    } else {
        return apiClient.post(`${api}`, data)
            .then((response) => response.data)
            .catch((error) => {
                console.error("Error al guardar retencion:", error);
                throw error;
            });
    }
}
