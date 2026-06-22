import apiClient from "../services/apiClient";
import {
    HdAdjunto,
    HdComentario,
    HdComentarioCreateForm,
    HdEstado,
    HdPrioridad,
    HdTicketCreateForm,
    HdTicketDetalle,
    HdTicketResumen,
    PageResult,
} from "../models/helpdesk";

const BASE = "/api/v1/helpdesk/tickets";

export function listarTickets(
    q = "",
    estadoId?: string,
    page = 0,
    size = 50
): Promise<PageResult<HdTicketResumen>> {
    const params: Record<string, string | number> = { q, page, size };
    if (estadoId) params.estadoId = estadoId;
    return apiClient.get(BASE, { params }).then((r) => r.data);
}

export function obtenerTicket(id: number): Promise<HdTicketDetalle> {
    return apiClient.get(`${BASE}/${id}`).then((r) => r.data);
}

export function crearTicket(dto: HdTicketCreateForm): Promise<HdTicketDetalle> {
    return apiClient.post(BASE, dto).then((r) => r.data);
}

export function agregarComentario(
    ticketId: number,
    dto: HdComentarioCreateForm
): Promise<HdComentario> {
    return apiClient.post(`${BASE}/${ticketId}/comentarios`, dto).then((r) => r.data);
}

export function subirAdjunto(
    ticketId: number,
    file: File,
    comentarioId?: number
): Promise<HdAdjunto> {
    const form = new FormData();
    form.append("file", file);
    if (comentarioId != null) form.append("comentarioId", String(comentarioId));
    return apiClient
        .post(`${BASE}/${ticketId}/adjuntos`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
}

export function descargarAdjuntoUrl(adjuntoId: number): string {
    return `${BASE}/adjuntos/${adjuntoId}/descargar`;
}

export function getEstados(): Promise<HdEstado[]> {
    return apiClient.get(`${BASE}/estados`).then((r) => r.data);
}

export function getPrioridades(): Promise<HdPrioridad[]> {
    return apiClient.get(`${BASE}/prioridades`).then((r) => r.data);
}
