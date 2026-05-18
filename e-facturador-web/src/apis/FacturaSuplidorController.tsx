import apiClient from "../services/apiClient";
import {
    MfFacturaSuplidor,
    MfFacturaSuplidorRequest,
    MfFacturaSuplidorResumen,
    MfFacturaSuplidorSearchCriteria,
} from "../models/facturacion/MfFacturaSuplidor";

const api = "/api/v1/facturacion/facturas-suplidor";

const extractNumericId = (value: any): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "object") {
        const n = Number(value.id);
        return isNaN(n) ? undefined : n;
    }
    const n = Number(value);
    return isNaN(n) ? undefined : n;
};

const normalizePayload = (dto: MfFacturaSuplidorRequest): MfFacturaSuplidorRequest => ({
    ...dto,
    suplidorId: extractNumericId((dto as any).suplidorId) ?? dto.suplidorId,
});

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
    return apiClient.post(api, normalizePayload(dto)).then((r) => r.data as MfFacturaSuplidor);
}

export function updateFacturaSuplidor(
    id: number,
    dto: MfFacturaSuplidorRequest,
): Promise<MfFacturaSuplidor> {
    return apiClient.put(`${api}/${id}`, normalizePayload(dto)).then((r) => r.data as MfFacturaSuplidor);
}
