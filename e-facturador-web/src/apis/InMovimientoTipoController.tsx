import apiClient from "../services/apiClient";

const BASE = "/api/v1/inventario/movimientos-tipos";

export interface InMovimientoTipo {
    id: number;
    tipoMovimiento: string;
    cr: boolean;
    modulo: string;
    modificable: boolean;
    usuarioReg: string;
    fechaReg: string;
}

export const getAllMovimientoTipos = async (): Promise<InMovimientoTipo[]> => {
    const res = await apiClient.get<InMovimientoTipo[]>(BASE);
    return res.data;
};

export const getMovimientoTiposByCr = async (cr: boolean): Promise<InMovimientoTipo[]> => {
    const res = await apiClient.get<InMovimientoTipo[]>(`${BASE}/por-cr`, { params: { cr } });
    return res.data;
};

export const getMovimientoTiposByModulo = async (modulo: string): Promise<InMovimientoTipo[]> => {
    const res = await apiClient.get<InMovimientoTipo[]>(`${BASE}/por-modulo`, { params: { modulo } });
    return res.data;
};
