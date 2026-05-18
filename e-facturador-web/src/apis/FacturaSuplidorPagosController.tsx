import apiClient from "../services/apiClient";
import {
    MfFacturaSuplidorFormaPago,
    MfFacturaSuplidorPagos,
    MfFacturaSuplidorPagosRequest,
    MfFacturaSuplidorPagosResumen,
    MfFacturaSuplidorPagosSearchCriteria,
} from "../models/facturacion/MfFacturaSuplidorPagos";

const api = "/api/v1/facturacion/pagos-suplidor";

export function buscarPagosSuplidor(
    criteria: MfFacturaSuplidorPagosSearchCriteria,
): Promise<MfFacturaSuplidorPagosResumen[]> {
    return apiClient
        .post(`${api}/buscar`, criteria)
        .then((r) => r.data as MfFacturaSuplidorPagosResumen[])
        .catch((error) => {
            console.error("buscarPagosSuplidor error:", error);
            return [];
        });
}

export function getPagoSuplidorById(id: number): Promise<MfFacturaSuplidorPagos | null> {
    return apiClient
        .get(`${api}/${id}`)
        .then((r) => r.data as MfFacturaSuplidorPagos)
        .catch((error) => {
            console.error("getPagoSuplidorById error:", error);
            return null;
        });
}

export function getFormasPagoSuplidor(): Promise<MfFacturaSuplidorFormaPago[]> {
    return apiClient
        .get(`${api}/formas-pago`)
        .then((r) => r.data as MfFacturaSuplidorFormaPago[])
        .catch((error) => {
            console.error("getFormasPagoSuplidor error:", error);
            return [];
        });
}

export function savePagoSuplidor(
    dto: MfFacturaSuplidorPagosRequest,
): Promise<MfFacturaSuplidorPagos> {
    return apiClient.post(api, dto).then((r) => r.data as MfFacturaSuplidorPagos);
}

export function updatePagoSuplidor(
    id: number,
    dto: MfFacturaSuplidorPagosRequest,
): Promise<MfFacturaSuplidorPagos> {
    return apiClient.put(`${api}/${id}`, dto).then((r) => r.data as MfFacturaSuplidorPagos);
}

export function anularPagoSuplidor(id: number): Promise<MfFacturaSuplidorPagos> {
    return apiClient
        .patch(`${api}/${id}/anular`)
        .then((r) => r.data as MfFacturaSuplidorPagos);
}
