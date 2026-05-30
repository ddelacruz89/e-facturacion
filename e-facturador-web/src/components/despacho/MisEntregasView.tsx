import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    IconButton,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ActionBar from "../../customers/ActionBar";
import { MisEntregasOrdenDTO, MisEntregasRutaDTO } from "../../models/despacho/DespachoModels";
import { getMisEntregas, marcarEstadoOrden } from "../../apis/DeOrdenDespachoController";

const ESTADO_ORDEN_LABELS: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "success" | "error" }> = {
    PEN: { label: "Pendiente", color: "warning" },
    EN_RUTA: { label: "En Ruta", color: "info" },
    EN_CAMINO: { label: "En Camino", color: "primary" },
    ENTREGADO: { label: "Entregado", color: "success" },
    DEVUELTO: { label: "Devuelto", color: "error" },
    ANU: { label: "Anulado", color: "default" },
};

const ESTADO_RUTA_COLOR: Record<string, "default" | "warning" | "info" | "success"> = {
    PLANIFICADA: "warning",
    EN_CURSO: "info",
    COMPLETADA: "success",
    ANU: "default",
};

export const MisEntregasView: React.FC = () => {
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [rutas, setRutas] = useState<MisEntregasRutaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [notasModal, setNotasModal] = useState<{ ordenId: number; estadoId: string } | null>(null);
    const [notas, setNotas] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const showMsg = (msg: string, severity: "success" | "error" = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const cargarEntregas = async () => {
        setLoading(true);
        try {
            const data = await getMisEntregas(fecha);
            setRutas(data);
            setExpanded(new Set(data.map((r) => r.rutaId)));
        } catch {
            showMsg("Error al cargar las entregas.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEntregas();
    }, [fecha]);

    const toggleExpand = (rutaId: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(rutaId)) next.delete(rutaId);
            else next.add(rutaId);
            return next;
        });
    };

    const handleMarcarEstado = async (orden: MisEntregasOrdenDTO, estadoId: string) => {
        if (estadoId === "DEVUELTO") {
            setNotasModal({ ordenId: orden.id, estadoId });
            setNotas("");
            return;
        }
        await ejecutarMarcarEstado(orden.id, estadoId, undefined);
    };

    const ejecutarMarcarEstado = async (ordenId: number, estadoId: string, notasVal?: string) => {
        try {
            await marcarEstadoOrden(ordenId, { estadoId, notas: notasVal });
            showMsg(`Orden actualizada: ${ESTADO_ORDEN_LABELS[estadoId]?.label ?? estadoId}`);
            cargarEntregas();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al actualizar.", "error");
        }
    };

    const confirmarDevolucion = async () => {
        if (!notasModal) return;
        await ejecutarMarcarEstado(notasModal.ordenId, notasModal.estadoId, notas);
        setNotasModal(null);
    };

    const totalOrdenes = rutas.reduce((acc, r) => acc + r.ordenes.length, 0);
    const totalEntregadas = rutas.reduce(
        (acc, r) => acc + r.ordenes.filter((o) => o.estadoId === "ENTREGADO").length,
        0
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Mis Entregas" />

            <Box sx={{ p: 2 }}>
                {/* Selector de fecha */}
                <Paper sx={{ p: 2, mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        label="Fecha"
                        type="date"
                        size="small"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={cargarEntregas}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={18} /> : "Actualizar"}
                    </Button>
                    {totalOrdenes > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {totalEntregadas} / {totalOrdenes} entregadas
                        </Typography>
                    )}
                </Paper>

                {/* Sin entregas */}
                {!loading && rutas.length === 0 && (
                    <Alert severity="info">
                        No tienes rutas de entrega asignadas para el {new Date(fecha + "T00:00").toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" })}.
                    </Alert>
                )}

                {/* Lista de rutas */}
                {rutas.map((ruta) => (
                    <Paper key={ruta.rutaId} sx={{ mb: 2, overflow: "hidden" }}>
                        {/* Header de la ruta */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 1.5,
                                backgroundColor: "#272C36",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                            onClick={() => toggleExpand(ruta.rutaId)}
                        >
                            <LocalShippingIcon sx={{ fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ flex: 1, color: "#fff" }}>
                                Ruta #{ruta.rutaSecuencia} — {ruta.vehiculoDescripcion ?? "Vehículo"}
                                {ruta.vehiculoPlaca ? ` (${ruta.vehiculoPlaca})` : ""}
                            </Typography>
                            <Chip
                                label={ruta.estadoRuta}
                                size="small"
                                color={ESTADO_RUTA_COLOR[ruta.estadoRuta] ?? "default"}
                                sx={{ mr: 1 }}
                            />
                            <Typography variant="caption" sx={{ color: "#ccc", mr: 1 }}>
                                {ruta.ordenes.filter((o) => o.estadoId === "ENTREGADO").length}/{ruta.ordenes.length}
                            </Typography>
                            <IconButton size="small" sx={{ color: "#fff" }}>
                                {expanded.has(ruta.rutaId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>

                        {/* Órdenes */}
                        <Collapse in={expanded.has(ruta.rutaId)}>
                            {ruta.ordenes.map((orden, idx) => {
                                const entregada = orden.estadoId === "ENTREGADO";
                                const enCamino = orden.estadoId === "EN_CAMINO";
                                const enRuta = orden.estadoId === "EN_RUTA";
                                const devuelta = orden.estadoId === "DEVUELTO";

                                return (
                                    <Box
                                        key={orden.id}
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            borderBottom: idx < ruta.ordenes.length - 1 ? "1px solid #f0f0f0" : "none",
                                            backgroundColor: entregada ? "#f0fdf4" : devuelta ? "#fef2f2" : "white",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                            {entregada && <CheckCircleIcon sx={{ color: "#16a34a", mt: 0.3, fontSize: 20 }} />}
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        #{orden.secuencia} — {orden.clienteNombre}
                                                    </Typography>
                                                    <Chip
                                                        label={ESTADO_ORDEN_LABELS[orden.estadoId]?.label ?? orden.estadoId}
                                                        color={ESTADO_ORDEN_LABELS[orden.estadoId]?.color ?? "default"}
                                                        size="small"
                                                    />
                                                </Box>

                                                {orden.clienteTelefono && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Tel: {orden.clienteTelefono}
                                                    </Typography>
                                                )}
                                                {orden.direccionEntrega && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                        Dir: {orden.direccionEntrega}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                    Compromiso:{" "}
                                                    {new Date(orden.fechaCompromiso).toLocaleString("es-DO")}
                                                </Typography>
                                                {entregada && orden.fechaEntrega && (
                                                    <Typography variant="caption" sx={{ color: "#16a34a", display: "block" }}>
                                                        Entregado:{" "}
                                                        {new Date(orden.fechaEntrega).toLocaleString("es-DO")}
                                                    </Typography>
                                                )}
                                                {orden.notas && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                        Nota: {orden.notas}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Acciones según estado */}
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                {(enRuta || enCamino) && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => handleMarcarEstado(orden, "EN_CAMINO")}
                                                        disabled={enCamino}
                                                        sx={{ fontSize: "0.7rem", py: 0.3 }}
                                                    >
                                                        En Camino
                                                    </Button>
                                                )}
                                                {enCamino && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleMarcarEstado(orden, "ENTREGADO")}
                                                        sx={{ fontSize: "0.7rem", py: 0.3 }}
                                                    >
                                                        Entregado
                                                    </Button>
                                                )}
                                                {enCamino && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleMarcarEstado(orden, "DEVUELTO")}
                                                        sx={{ fontSize: "0.7rem", py: 0.3 }}
                                                    >
                                                        Devuelto
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Collapse>
                    </Paper>
                ))}

                {/* Modal de devolución */}
                {notasModal && (
                    <Paper
                        sx={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            p: 3,
                            zIndex: 1300,
                            minWidth: 320,
                            boxShadow: 8,
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Marcar como Devuelto
                        </Typography>
                        <TextField
                            label="Motivo de devolución"
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button size="small" onClick={() => setNotasModal(null)}>
                                Cancelar
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={confirmarDevolucion}
                            >
                                Confirmar
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MisEntregasView;
