import { SgEmpresa } from "../models/seguridad";
import { apiUtils } from "../services/apiClient";

const EMPRESA_API = "/api/seguridad/empresa";

export class EmpresaController {
    /**
     * Get empresa data
     */
    static async getEmpresa(): Promise<SgEmpresa> {
        try {
            const response = await apiUtils.get<{ content: SgEmpresa }>(EMPRESA_API);
            return response.content;
        } catch (error) {
            console.error("Error getting empresa:", error);
            throw error;
        }
    }

    /**
     * Save empresa data
     */
    static async saveEmpresa(empresa: SgEmpresa): Promise<SgEmpresa> {
        try {
            const response = await apiUtils.post<{ content: SgEmpresa }>(EMPRESA_API, empresa);
            return response.content;
        } catch (error) {
            console.error("Error saving empresa:", error);
            throw error;
        }
    }

    /**
     * Upload empresa logo
     */
    static async uploadLogo(file: File, onProgress?: (progress: number) => void): Promise<{ logo: number[] }> {
        try {
            const response = await apiUtils.upload<{ logo: number[] }>(`${EMPRESA_API}/logo`, file, onProgress);
            return response;
        } catch (error) {
            console.error("Error uploading logo:", error);
            throw error;
        }
    }
}

// Legacy exports for backward compatibility
export const getEmpresa = EmpresaController.getEmpresa;
export const saveEmpresa = EmpresaController.saveEmpresa;
