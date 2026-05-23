import apiClient from "../services/apiClient";

const api = "/api/v1/inventario/alertas";

export interface InAlertaDTO {
    id: number;
    tipo: "VENCIMIENTO" | "STOCK_BAJO";
    productoId: number;
    almacenId?: number;
    lote?: string;
    cantidadActual?: number;
    limite?: number;
    fechaVencimiento?: string;
    fechaReg: string;
    usuarioReg: string;
    empresaId: number;
    sucursalId: number;
    visto: boolean;
}

/** Alertas activas del tenant con flag visto resuelto para el usuario autenticado. */
export function getAlertasActivas(): Promise<InAlertaDTO[]> {
    return apiClient.get(api).then((x: { data: InAlertaDTO[] }) => x.data);
}

/** Número de alertas activas no vistas por el usuario autenticado. */
export function getContadorNoVistas(): Promise<number> {
    return apiClient
        .get(`${api}/contador`)
        .then((x: { data: { noVistas: number } }) => x.data.noVistas);
}

/** Marca una alerta como vista. Idempotente. */
export function marcarVisto(alertaId: number): Promise<void> {
    return apiClient.post(`${api}/${alertaId}/visto`);
}

/** Cierra una alerta (la saca del listado activo). */
export function cerrarAlerta(alertaId: number): Promise<void> {
    return apiClient.put(`${api}/${alertaId}/cerrar`);
}
