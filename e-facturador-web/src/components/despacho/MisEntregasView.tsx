import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
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
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ActionBar from "../../customers/ActionBar";
import { MisEntregasOrdenDTO, MisEntregasRutaDTO } from "../../models/despacho/DespachoModels";
import { getMisEntregas, marcarEstadoOrden } from "../../apis/DeOrdenDespachoController";
import { uploadReciboOrden } from "../../apis/FeaturePlanController";
import ReciboViewer, { resolveReciboUrl } from "./ReciboViewer";

const ESTADO_ORDEN_LABELS: Record<
    string,
    { label: string; color: "default" | "warning" | "info" | "primary" | "success" | "error" }
> = {
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

// ── Modal de recibo ──────────────────────────────────────────────────────────

interface ReciboModalProps {
    orden: MisEntregasOrdenDTO;
    onConfirm: (file: File) => Promise<void>;
    onCancel: () => void;
}

const ReciboModal: React.FC<ReciboModalProps> = ({ orden, onConfirm, onCancel }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleConfirm = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            await onConfirm(selectedFile);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 1299,
                }}
                onClick={onCancel}
            />
            <Paper
                sx={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    p: { xs: 2.5, sm: 3 },
                    zIndex: 1300,
                    width: { xs: "calc(100vw - 32px)", sm: "auto" },
                    minWidth: { sm: 340 },
                    maxWidth: { xs: "100%", sm: 480 },
                    boxShadow: 8,
                }}
            >
                <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Recibo de Entrega
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    #{orden.secuencia} — {orden.clienteNombre}
                </Typography>

                {/* Input de cámara / archivo */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                {!preview ? (
                    <Box
                        sx={{
                            border: "2px dashed #ccc",
                            borderRadius: 2,
                            p: 3,
                            textAlign: "center",
                            cursor: "pointer",
                            mb: 2,
                            "&:hover": { borderColor: "#848EA5" },
                        }}
                        onClick={() => inputRef.current?.click()}
                    >
                        <CameraAltIcon sx={{ fontSize: 40, color: "#848EA5", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Toca para tomar foto o elegir imagen
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ mb: 2, textAlign: "center" }}>
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: 220,
                                borderRadius: 8,
                                objectFit: "contain",
                            }}
                        />
                        <Button
                            size="small"
                            onClick={() => {
                                setPreview(null);
                                setSelectedFile(null);
                            }}
                            sx={{ mt: 0.5, display: "block", mx: "auto" }}
                        >
                            Cambiar imagen
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button onClick={onCancel} sx={{ minHeight: { xs: 44, sm: 36 } }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleConfirm}
                        disabled={!selectedFile || uploading}
                        sx={{ minHeight: { xs: 44, sm: 36 } }}
                    >
                        {uploading ? <CircularProgress size={18} color="inherit" /> : "Confirmar Entrega"}
                    </Button>
                </Box>
            </Paper>
        </>
    );
};

// ── Vista principal ──────────────────────────────────────────────────────────

export const MisEntregasView: React.FC = () => {
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [rutas, setRutas] = useState<MisEntregasRutaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [notasModal, setNotasModal] = useState<{ ordenId: number; estadoId: string } | null>(null);
    const [notas, setNotas] = useState("");
    const [reciboModal, setReciboModal] = useState<MisEntregasOrdenDTO | null>(null);
    const [reciboViewer, setReciboViewer] = useState<MisEntregasOrdenDTO | null>(null);
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
        // Si el feature de recibo está activo y no tiene recibo aún → pide foto primero
        if (estadoId === "ENTREGADO" && orden.requiereRecibo && !orden.reciboUrl) {
            setReciboModal(orden);
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

    const handleReciboConfirm = async (file: File) => {
        if (!reciboModal) return;
        try {
            await uploadReciboOrden(reciboModal.id, file);
            showMsg("Recibo subido. Marcando como entregado…");
            setReciboModal(null);
            await ejecutarMarcarEstado(reciboModal.id, "ENTREGADO", undefined);
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al subir el recibo.", "error");
        }
    };

    const totalOrdenes = rutas.reduce((acc, r) => acc + r.ordenes.length, 0);
    const totalEntregadas = rutas.reduce(
        (acc, r) => acc + r.ordenes.filter((o) => o.estadoId === "ENTREGADO").length,
        0
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Mis Entregas" />

            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                {/* Barra de fecha y actualizar */}
                <Paper
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        mb: 2,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        alignItems: "center",
                    }}
                >
                    <TextField
                        label="Fecha"
                        type="date"
                        size="small"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: "1 1 150px" }}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={cargarEntregas}
                        disabled={loading}
                        sx={{ minHeight: 40, flex: "0 0 auto" }}
                    >
                        {loading ? <CircularProgress size={18} /> : "Actualizar"}
                    </Button>
                    {totalOrdenes > 0 && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ flex: "1 1 auto", textAlign: { xs: "right", sm: "left" } }}
                        >
                            {totalEntregadas} / {totalOrdenes} entregadas
                        </Typography>
                    )}
                </Paper>

                {/* Sin entregas */}
                {!loading && rutas.length === 0 && (
                    <Alert severity="info">
                        No tienes rutas de entrega asignadas para el{" "}
                        {new Date(fecha + "T00:00").toLocaleDateString("es-DO", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                        .
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
                                px: { xs: 1.5, sm: 2 },
                                py: 1.5,
                                backgroundColor: "#272C36",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                            onClick={() => toggleExpand(ruta.rutaId)}
                        >
                            <LocalShippingIcon sx={{ fontSize: 20, flexShrink: 0 }} />
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    flex: 1,
                                    color: "#fff",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Ruta #{ruta.rutaSecuencia}
                                {" — "}
                                {ruta.vehiculoDescripcion ?? "Vehículo"}
                                {ruta.vehiculoPlaca ? ` (${ruta.vehiculoPlaca})` : ""}
                            </Typography>
                            <Chip
                                label={ruta.estadoRuta}
                                size="small"
                                color={ESTADO_RUTA_COLOR[ruta.estadoRuta] ?? "default"}
                                sx={{ flexShrink: 0 }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ color: "#ccc", flexShrink: 0, display: { xs: "none", sm: "block" } }}
                            >
                                {ruta.ordenes.filter((o) => o.estadoId === "ENTREGADO").length}/
                                {ruta.ordenes.length}
                            </Typography>
                            <IconButton size="small" sx={{ color: "#fff", flexShrink: 0 }}>
                                {expanded.has(ruta.rutaId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>

                        {/* Progreso compacto en mobile */}
                        <Collapse in={expanded.has(ruta.rutaId)}>
                            <Box
                                sx={{
                                    display: { xs: "flex", sm: "none" },
                                    justifyContent: "flex-end",
                                    px: 1.5,
                                    py: 0.5,
                                    backgroundColor: "#3a4050",
                                }}
                            >
                                <Typography variant="caption" sx={{ color: "#ccc" }}>
                                    {ruta.ordenes.filter((o) => o.estadoId === "ENTREGADO").length}/
                                    {ruta.ordenes.length} entregadas
                                </Typography>
                            </Box>

                            {/* Órdenes */}
                            {ruta.ordenes.map((orden, idx) => {
                                const entregada = orden.estadoId === "ENTREGADO";
                                const enCamino = orden.estadoId === "EN_CAMINO";
                                const enRuta = orden.estadoId === "EN_RUTA";
                                const devuelta = orden.estadoId === "DEVUELTO";
                                const tieneAcciones = enRuta || enCamino;
                                const necesitaRecibo =
                                    orden.requiereRecibo && enCamino && !orden.reciboUrl;

                                return (
                                    <Box
                                        key={orden.id}
                                        sx={{
                                            px: { xs: 1.5, sm: 2 },
                                            py: 1.5,
                                            borderBottom:
                                                idx < ruta.ordenes.length - 1
                                                    ? "1px solid #f0f0f0"
                                                    : "none",
                                            backgroundColor: entregada
                                                ? "#f0fdf4"
                                                : devuelta
                                                ? "#fef2f2"
                                                : "white",
                                        }}
                                    >
                                        {/* Fila superior */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                gap: 0.5,
                                                mb: 0.5,
                                            }}
                                        >
                                            {entregada && (
                                                <CheckCircleIcon
                                                    sx={{ color: "#16a34a", fontSize: 18, flexShrink: 0 }}
                                                />
                                            )}
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 600, flex: "1 1 auto" }}
                                            >
                                                #{orden.secuencia} — {orden.clienteNombre}
                                            </Typography>
                                            <Chip
                                                label={
                                                    ESTADO_ORDEN_LABELS[orden.estadoId]?.label ??
                                                    orden.estadoId
                                                }
                                                color={
                                                    ESTADO_ORDEN_LABELS[orden.estadoId]?.color ??
                                                    "default"
                                                }
                                                size="small"
                                                sx={{ flexShrink: 0 }}
                                            />
                                        </Box>

                                        {/* Datos */}
                                        {orden.clienteTelefono && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: "block" }}
                                            >
                                                📞 {orden.clienteTelefono}
                                            </Typography>
                                        )}
                                        {orden.direccionEntrega && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: "block" }}
                                            >
                                                📍 {orden.direccionEntrega}
                                            </Typography>
                                        )}
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: "block" }}
                                        >
                                            🕐 Compromiso:{" "}
                                            {new Date(orden.fechaCompromiso).toLocaleString("es-DO")}
                                        </Typography>
                                        {entregada && orden.fechaEntrega && (
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "#16a34a", display: "block" }}
                                            >
                                                ✅ Entregado:{" "}
                                                {new Date(orden.fechaEntrega).toLocaleString("es-DO")}
                                            </Typography>
                                        )}
                                        {orden.notas && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: "block" }}
                                            >
                                                📝 {orden.notas}
                                            </Typography>
                                        )}

                                        {/* Recibo adjunto — toca para ver */}
                                        {orden.reciboUrl && (
                                            <Box
                                                onClick={() => setReciboViewer(orden)}
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.4,
                                                    mt: 0.25,
                                                    cursor: "pointer",
                                                    color: "#2563eb",
                                                    "&:hover": { color: "#1d4ed8" },
                                                }}
                                            >
                                                <ReceiptLongIcon sx={{ fontSize: 13 }} />
                                                <Typography variant="caption" sx={{ color: "inherit" }}>
                                                    Ver recibo
                                                </Typography>
                                                <ZoomInIcon sx={{ fontSize: 13 }} />
                                            </Box>
                                        )}

                                        {/* Aviso si falta recibo */}
                                        {necesitaRecibo && (
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "#d97706", display: "block", mt: 0.25 }}
                                            >
                                                📷 Se requiere foto del recibo para confirmar entrega
                                            </Typography>
                                        )}

                                        {/* Acciones */}
                                        {tieneAcciones && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 0.75,
                                                    mt: 1.5,
                                                }}
                                            >
                                                {(enRuta || enCamino) && (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() =>
                                                            handleMarcarEstado(orden, "EN_CAMINO")
                                                        }
                                                        disabled={enCamino}
                                                        sx={{
                                                            flex: { xs: "1 1 auto", sm: "0 0 auto" },
                                                            minHeight: { xs: 44, sm: 32 },
                                                            fontSize: { xs: "0.8rem", sm: "0.7rem" },
                                                            py: { xs: 0.5, sm: 0.3 },
                                                        }}
                                                    >
                                                        En Camino
                                                    </Button>
                                                )}
                                                {enCamino && (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() =>
                                                            handleMarcarEstado(orden, "ENTREGADO")
                                                        }
                                                        sx={{
                                                            flex: { xs: "1 1 auto", sm: "0 0 auto" },
                                                            minHeight: { xs: 44, sm: 32 },
                                                            fontSize: { xs: "0.8rem", sm: "0.7rem" },
                                                            py: { xs: 0.5, sm: 0.3 },
                                                        }}
                                                    >
                                                        {necesitaRecibo ? (
                                                            <>
                                                                <CameraAltIcon sx={{ mr: 0.5, fontSize: 16 }} />
                                                                Foto + Entregar
                                                            </>
                                                        ) : (
                                                            "Entregado"
                                                        )}
                                                    </Button>
                                                )}
                                                {enCamino && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() =>
                                                            handleMarcarEstado(orden, "DEVUELTO")
                                                        }
                                                        sx={{
                                                            flex: { xs: "1 1 auto", sm: "0 0 auto" },
                                                            minHeight: { xs: 44, sm: 32 },
                                                            fontSize: { xs: "0.8rem", sm: "0.7rem" },
                                                            py: { xs: 0.5, sm: 0.3 },
                                                        }}
                                                    >
                                                        Devuelto
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Collapse>
                    </Paper>
                ))}

                {/* Modal de devolución */}
                {notasModal && (
                    <>
                        <Box
                            sx={{
                                position: "fixed",
                                inset: 0,
                                backgroundColor: "rgba(0,0,0,0.4)",
                                zIndex: 1299,
                            }}
                            onClick={() => setNotasModal(null)}
                        />
                        <Paper
                            sx={{
                                position: "fixed",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                p: { xs: 2.5, sm: 3 },
                                zIndex: 1300,
                                width: { xs: "calc(100vw - 32px)", sm: "auto" },
                                minWidth: { sm: 320 },
                                maxWidth: { xs: "100%", sm: 440 },
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
                                rows={3}
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                <Button
                                    onClick={() => setNotasModal(null)}
                                    sx={{ minHeight: { xs: 44, sm: 36 } }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={confirmarDevolucion}
                                    sx={{ minHeight: { xs: 44, sm: 36 } }}
                                >
                                    Confirmar
                                </Button>
                            </Box>
                        </Paper>
                    </>
                )}

                {/* Modal de recibo (upload) */}
                {reciboModal && (
                    <ReciboModal
                        orden={reciboModal}
                        onConfirm={handleReciboConfirm}
                        onCancel={() => setReciboModal(null)}
                    />
                )}

                {/* Visor de recibo (ver imagen ya subida) */}
                {reciboViewer && reciboViewer.reciboUrl && (
                    <ReciboViewer
                        ordenId={reciboViewer.id}
                        reciboUrl={reciboViewer.reciboUrl}
                        clienteNombre={reciboViewer.clienteNombre}
                        onClose={() => setReciboViewer(null)}
                    />
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
