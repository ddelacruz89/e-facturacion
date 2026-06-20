import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ActionBar from "../../customers/ActionBar";
import {
    obtenerTicket,
    agregarComentario,
    subirAdjunto,
    descargarAdjuntoUrl,
} from "../../apis/HelpdeskController";
import { HdComentario, HdTicketDetalle } from "../../models/helpdesk";
import { toast } from "react-toastify";

const ESTADO_COLORES: Record<string, "default" | "warning" | "info" | "primary" | "success" | "error"> = {
    PEND_ASIG: "warning",
    ASIG:      "info",
    PROC:      "primary",
    ESP:       "default",
    COMP:      "success",
    CANC:      "error",
};

const TicketDetalleView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [ticket, setTicket]         = useState<HdTicketDetalle | null>(null);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando]     = useState(false);

    useEffect(() => { cargar(); }, [id]);

    const cargar = () => {
        if (!id) return;
        obtenerTicket(Number(id))
            .then(setTicket)
            .catch(() => toast.error("Error cargando el ticket"));
    };

    const enviarComentario = async () => {
        if (!comentario.trim() || !id) return;
        setEnviando(true);
        try {
            await agregarComentario(Number(id), { contenido: comentario });
            setComentario("");
            cargar();
        } catch {
            toast.error("Error al enviar comentario");
        } finally {
            setEnviando(false);
        }
    };

    const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;
        try {
            await subirAdjunto(Number(id), file);
            toast.success("Adjunto subido");
            cargar();
        } catch {
            toast.error("Error subiendo el archivo");
        } finally {
            e.target.value = "";
        }
    };

    if (!ticket) return <Typography sx={{ p: 3 }}>Cargando...</Typography>;

    const vencido = new Date(ticket.fechaLimite) < new Date();
    const proximo = !vencido && new Date(ticket.fechaLimite) < new Date(Date.now() + 24 * 60 * 60 * 1000);

    return (
        <main>
            <ActionBar title={`Ticket #${ticket.id}`}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/helpdesk/tickets")}>
                    Volver
                </Button>
            </ActionBar>

            <Box sx={{ p: 2 }}>
                {(vencido || proximo) && (
                    <Alert
                        severity={vencido ? "error" : "warning"}
                        icon={<WarningAmberIcon />}
                        sx={{ mb: 2 }}
                    >
                        {vencido
                            ? "Este ticket superó su tiempo de respuesta (SLA)"
                            : "Este ticket vence en menos de 24 horas"}
                    </Alert>
                )}

                {/* Encabezado */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h6">{ticket.titulo}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                                <Chip
                                    label={ticket.estadoNombre}
                                    color={ESTADO_COLORES[ticket.estadoId] ?? "default"}
                                    size="small"
                                />
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="text.secondary">Prioridad:</Typography>
                                <Chip
                                    label={ticket.prioridadNombre}
                                    variant="outlined"
                                    size="small"
                                    color={ticket.prioridadId === "ALTA" ? "error" : ticket.prioridadId === "MEDIA" ? "warning" : "default"}
                                />
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                Creado: {new Date(ticket.fechaReg).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="body2"
                                color={vencido ? "error" : proximo ? "warning.main" : "text.secondary"}
                            >
                                Vence: {new Date(ticket.fechaLimite).toLocaleString()}
                            </Typography>
                        </Grid>
                        {ticket.soporteAsignado.length > 0 && (
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Soporte asignado: {ticket.soporteAsignado.join(", ")}
                                </Typography>
                            </Grid>
                        )}
                        <Grid size={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body1" whiteSpace="pre-wrap">
                                {ticket.descripcion}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Adjuntos del ticket */}
                {ticket.adjuntos.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Archivos adjuntos</Typography>
                        <Stack spacing={0.5}>
                            {ticket.adjuntos.map((a) => (
                                <Stack key={a.id} direction="row" spacing={1} alignItems="center">
                                    <AttachFileIcon fontSize="small" />
                                    <Typography variant="body2">{a.nombreArchivo}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ({(a.tamanioBytes / 1024).toFixed(0)} KB)
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        component="a"
                                        href={descargarAdjuntoUrl(a.id)}
                                        download={a.nombreArchivo}
                                    >
                                        <DownloadIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                )}

                <Divider sx={{ mb: 2 }}>Conversación</Divider>

                {/* Hilo de comentarios */}
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {ticket.comentarios.length === 0 && (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            No hay comentarios aún. Escribe el primero.
                        </Typography>
                    )}
                    {ticket.comentarios.map((c) => (
                        <ComentarioBurbuja key={c.id} comentario={c} />
                    ))}
                </Stack>

                {/* Enviar comentario */}
                {!["COMP", "CANC"].includes(ticket.estadoId) && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            placeholder="Escribe tu comentario..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            sx={{ mb: 1 }}
                        />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                onChange={handleArchivoSeleccionado}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<AttachFileIcon />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Adjuntar
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<SendIcon />}
                                disabled={!comentario.trim() || enviando}
                                onClick={enviarComentario}
                            >
                                Enviar
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* Historial de estados */}
                {ticket.historial.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 1 }}>Historial</Divider>
                        <Stack spacing={0.5}>
                            {ticket.historial.map((h, i) => (
                                <Typography key={i} variant="caption" color="text.secondary">
                                    {new Date(h.fecha).toLocaleString()} — {h.usuario}:{" "}
                                    {h.estadoAnterior ? `${h.estadoAnterior} → ` : ""}{h.estadoNuevo}
                                    {h.observacion ? ` (${h.observacion})` : ""}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Box>
        </main>
    );
};

const ComentarioBurbuja = ({ comentario }: { comentario: HdComentario }) => {
    const esCliente = comentario.origen === "CLIENTE";
    return (
        <Box display="flex" justifyContent={esCliente ? "flex-end" : "flex-start"}>
            <Paper
                variant="outlined"
                sx={{
                    maxWidth: "75%",
                    p: 1.5,
                    bgcolor: esCliente ? "primary.50" : "grey.50",
                    borderColor: esCliente ? "primary.200" : "grey.300",
                }}
            >
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {esCliente ? "Tú" : `Soporte — ${comentario.autor}`} ·{" "}
                    {new Date(comentario.fechaReg).toLocaleString()}
                </Typography>
                <Typography variant="body2" whiteSpace="pre-wrap">
                    {comentario.contenido}
                </Typography>
                {comentario.adjuntos.length > 0 && (
                    <Stack spacing={0.5} mt={1}>
                        {comentario.adjuntos.map((a) => (
                            <Stack key={a.id} direction="row" spacing={0.5} alignItems="center">
                                <AttachFileIcon fontSize="inherit" />
                                <Typography
                                    variant="caption"
                                    component="a"
                                    href={descargarAdjuntoUrl(a.id)}
                                    download={a.nombreArchivo}
                                >
                                    {a.nombreArchivo}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
};

export default TicketDetalleView;
