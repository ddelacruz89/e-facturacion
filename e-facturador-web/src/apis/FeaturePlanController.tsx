import apiClient from "../services/apiClient";
import { EmpresaFeatureConfigDTO, SgFeaturePlan } from "../models/seguridad/FeaturePlanModels";

const ADMIN_BASE = "/api/v1/admin/feature-plan";
const CONFIG_BASE = "/api/v1/empresa/feature-config";

// ── Admin (solo empresa_id = 1) ──────────────────────────────────────────────

export function getFeaturePlanByEmpresa(empresaId: number): Promise<SgFeaturePlan[]> {
    return apiClient.get(`${ADMIN_BASE}/empresa/${empresaId}`).then((r) => r.data);
}

export function getFeaturePlanByFeature(featureId: string): Promise<SgFeaturePlan[]> {
    return apiClient.get(`${ADMIN_BASE}/feature/${featureId}`).then((r) => r.data);
}

export function saveFeaturePlan(plan: SgFeaturePlan): Promise<SgFeaturePlan> {
    return apiClient.post(ADMIN_BASE, plan).then((r) => r.data);
}

// ── Config por empresa ───────────────────────────────────────────────────────

export function getEmpresaFeatureConfig(featureId: string): Promise<EmpresaFeatureConfigDTO> {
    return apiClient.get(`${CONFIG_BASE}/${featureId}`).then((r) => r.data);
}

/**
 * Guarda la configuración de un feature.
 * storageConfig debe ser un JSON serializado como string en el campo storageConfig del body.
 */
export function saveEmpresaFeatureConfig(
    featureId: string,
    config: {
        activo: boolean;
        storageTipo?: string;
        storageConfig?: string; // JSON string con credenciales
    }
): Promise<EmpresaFeatureConfigDTO> {
    return apiClient.put(`${CONFIG_BASE}/${featureId}`, config).then((r) => r.data);
}

/**
 * Sube un recibo de entrega para una orden.
 * @returns URL del archivo subido
 */
export function uploadReciboOrden(ordenId: number, file: File): Promise<{ reciboUrl: string }> {
    const form = new FormData();
    form.append("file", file);
    return apiClient
        .post(`/api/v1/despacho/ordenes/${ordenId}/recibo`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
}
