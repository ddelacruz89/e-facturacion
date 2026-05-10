import apiClient from "../services/apiClient";

const api = "/api/v1/facturacion/retenciones-itbis";

export interface MgRetencionItbisResumen {
    id: number;
    descripcion: string;
    valor: number;
    alTotal: boolean;
    tipoRetencion: string;
    comentarioFactura?: string;
}

export function getRetencionesPorTipo(tipo: "ITBIS" | "ISR"): Promise<MgRetencionItbisResumen[]> {
    return apiClient
        .get(`${api}/por-tipo`, { params: { tipo } })
        .then((r) => r.data as MgRetencionItbisResumen[])
        .catch((error) => {
            console.error(`getRetencionesPorTipo(${tipo}) error:`, error);
            return [];
        });
}
