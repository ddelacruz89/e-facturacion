import apiClient from "../services/apiClient";
import {
    MfFacturaSuplidor,
    MfFacturaSuplidorRequest,
    MfFacturaSuplidorResumen,
    MfFacturaSuplidorSearchCriteria,
} from "../models/facturacion/MfFacturaSuplidor";

const api = "/api/v1/facturacion/facturas-suplidor";

export function buscarFacturasSuplidor(
    criteria: MfFacturaSuplidorSearchCriteria,
): Promise<MfFacturaSuplidorResumen[]> {
    return apiClient
        .post(`${api}/buscar`, criteria)
        .then((r) => r.data as MfFacturaSuplidorResumen[])
        .catch((error) => {
            console.error("buscarFacturasSuplidor error:", error);
            return [];
        });
}

export function getFacturaSuplidorById(id: number): Promise<MfFacturaSuplidor | null> {
    return apiClient
        .get(`${api}/${id}`)
        .then((r) => r.data as MfFacturaSuplidor)
        .catch((error) => {
            console.error("getFacturaSuplidorById error:", error);
            return null;
        });
}

export function saveFacturaSuplidor(
    dto: MfFacturaSuplidorRequest,
): Promise<MfFacturaSuplidor> {
    return apiClient.post(api, dto).then((r) => r.data as MfFacturaSuplidor);
}

export function updateFacturaSuplidor(
    id: number,
    dto: MfFacturaSuplidorRequest,
): Promise<MfFacturaSuplidor> {
    return apiClient.put(`${api}/${id}`, dto).then((r) => r.data as MfFacturaSuplidor);
}
