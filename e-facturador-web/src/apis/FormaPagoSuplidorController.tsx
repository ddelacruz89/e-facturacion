import apiClient from "../services/apiClient";
import { MfFacturaSuplidorFormaPago } from "../models/facturacion/MfFacturaSuplidorPagos";

const api = "/api/v1/facturacion/formas-pago-suplidor";

export interface FormaPagoSuplidorRequest {
    formaPago: string;
    estadoId: string;
    tipoFormaPago?: string;
}

export function getAllFormasPago(): Promise<MfFacturaSuplidorFormaPago[]> {
    return apiClient
        .get(api)
        .then((r) => r.data as MfFacturaSuplidorFormaPago[])
        .catch((error) => {
            console.error("getAllFormasPago error:", error);
            return [];
        });
}

export function getFormaPagoById(id: number): Promise<MfFacturaSuplidorFormaPago | null> {
    return apiClient
        .get(`${api}/${id}`)
        .then((r) => r.data as MfFacturaSuplidorFormaPago)
        .catch((error) => {
            console.error("getFormaPagoById error:", error);
            return null;
        });
}

export function saveFormaPago(
    dto: FormaPagoSuplidorRequest,
): Promise<MfFacturaSuplidorFormaPago> {
    return apiClient.post(api, dto).then((r) => r.data as MfFacturaSuplidorFormaPago);
}

export function updateFormaPago(
    id: number,
    dto: FormaPagoSuplidorRequest,
): Promise<MfFacturaSuplidorFormaPago> {
    return apiClient.put(`${api}/${id}`, dto).then((r) => r.data as MfFacturaSuplidorFormaPago);
}
