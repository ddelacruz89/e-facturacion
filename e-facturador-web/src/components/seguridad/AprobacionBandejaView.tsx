import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ActionBar from "../../customers/ActionBar";
import {
    getMisPendientes,
    buscarAprobaciones,
    getAprobacion,
    aprobar,
    rechazar,
} from "../../apis/AprobacionController";
import {
    SgAprobacion,
    SgAprobacionResumenDTO,
    SgAprobacionSearchCriteria,
    ESTADO_APROBACION_COLOR,
    ESTADO_APROBACION_LABEL,
    TIPOS_DOCUMENTO,
} from "../../models/seguridad/SgAprobacion";
import { formatDateTimeForUi } from "../../types/modalSearchTypes";

// ── helpers ───────────────────────────────────────────────────────────────────

const hoy = () => new Date().toISOString().split("T")[0];
const hace30 = () => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
};

// ── Componente ────────────────────────────────────────────────────────────────

const AprobacionBandejaView = () => {
    const [resultados, setResultados] = useState<SgAprobacionResumenDTO[]>([]);
    const [cargando, setCargando] = useState(false);
    const [criteria, setCriteria] = useState<SgAprobacionSearchCriteria>({
        soloMisPendientes: true,
        estadoId: "PEN",
        fechaInicio: hace30(),
        fechaFin: hoy(),
    });

    // Detalle / modal
    const [detalleOpen, setDetalleOpen] = useState(false);
    const [aprobacionActual, setAprobacionActual] = useState<SgAprobacion | null>(null);

    // Modal de respuesta
    const [respuestaOpen, setRespuestaOpen] = useState(false);
    const [decision, setDecision] = useState<"APR" | "REC">("APR");
    const [comentario, setComentario] = useState("");
    const [procesando, setProcesando] = useState(false);

    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
        open: false, msg: "", severity: "success",
    });

    // ── Cargar ──────────────────────────────────────────────────────────────
    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const data = criteria.soloMisPendientes
                ? await getMisPendientes()
                : await buscarAprobaciones(criteria);
            setResultados(data);
        } catch {
            setSnack({ open: true, msg: "Error al cargar aprobaciones", severity: "error" });
        } finally { setCargando(false); }
    }, [criteria]);

    useEffect(() => { cargar(); }, [cargar]);

    // ── Abrir detalle ───────────────────────────────────────────────────────
    const handleVerDetalle = async (id: number) => {
        try {
            const completo = await getAprobacion(id);
            setAprobacionActual(completo);
            setDetalleOpen(true);
        } catch {
            setSnack({ open: true, msg: "Error al cargar el detalle", severity: "error" });
        }
    };

    // ── Aprobar / rechazar ──────────────────────────────────────────────────
    const abrirRespuesta = (d: "APR" | "REC") => {
        setDecision(d);
        setComentario("");
        setRespuestaOpen(true);
    };

    const confirmarRespuesta = async () => {
        if (!aprobacionActual?.id) return;
        if (decision === "REC" && !comentario.trim()) {
            setSnack({ open: true, msg: "El comentario es requerido al rechazar", severity: "error" });
            return;
        }
        setProcesando(true);
        try {
            const updated = decision === "APR"
                ? await aprobar(aprobacionActual.id, comentario)
                : await rechazar(aprobacionActual.id, comentario);
            setAprobacionActual(updated);
            setRespuestaOpen(false);
            setDetalleOpen(false);
            setSnack({
                open: true,
                msg: decision === "APR" ? "Aprobado correctamente" : "Rechazado correctamente",
                severity: "success",
            });
            cargar();
        } catch (e: any) {
            setSnack({ open: true, msg: e?.response?.data?.message ?? "Error al procesar", severity: "error" });
        } finally { setProcesando(false); }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <main>
            <ActionBar title="Bandeja de Aprobaciones">
                <Button size="small" variant="contained" onClick={cargar}
                    sx={{ bgcolor: "#716752", "&:hover": { bgcolor: "#5a5241" } }}>
                    Actualizar
                </Button>
            </ActionBar>

            {/* Filtros */}
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Vista</InputLabel>
                            <Select
                                label="Vista"
                                value={criteria.soloMisPendientes ? "mis" : "todos"}
                                onChange={(e) => setCriteria((c) => ({
                                    ...c,
                                    soloMisPendientes: e.target.value === "mis",
                                    estadoId: e.target.value === "mis" ? "PEN" : c.estadoId,
                                }))}>
                                <MenuItem value="mis">Mis pendientes</MenuItem>
                                <MenuItem value="todos">Todas las aprobaciones</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label="Estado"
                                value={criteria.estadoId ?? ""}
                                onChange={(e) => setCriteria((c) => ({ ...c, estadoId: e.target.value || undefined }))}>
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="PEN">Pendiente</MenuItem>
                                <MenuItem value="APR">Aprobado</MenuItem>
                                <MenuItem value="REC">Rechazado</MenuItem>
                                <MenuItem value="CAN">Cancelado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo documento</InputLabel>
                            <Select
                                label="Tipo documento"
                                value={criteria.tipoDocumento ?? ""}
                                onChange={(e) => setCriteria((c) => ({ ...c, tipoDocumento: e.target.value || undefined }))}>
                                <MenuItem value="">Todos</MenuItem>
                                {TIPOS_DOCUMENTO.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField label="Desde" type="date" size="small" fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={criteria.fechaInicio ?? ""}
                            onChange={(e) => setCriteria((c) => ({ ...c, fechaInicio: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField label="Hasta" type="date" size="small" fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={criteria.fechaFin ?? ""}
                            onChange={(e) => setCriteria((c) => ({ ...c, fechaFin: e.target.value }))} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }}>
                        <Button fullWidth size="small" variant="contained" onClick={cargar}
                            sx={{ bgcolor: "#5F5271", "&:hover": { bgcolor: "#4a3f5a" } }}>
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Tabla de resultados */}
            <Box sx={{ px: 2, pb: 2 }}>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead sx={{ "& th": { bgcolor: "#3D4453", color: "#fff", fontWeight: 600 } }}>
                            <TableRow>
                                <TableCell width="6%">ID</TableCell>
                                <TableCell width="16%">Tipo / Doc.</TableCell>
                                <TableCell width="20%">Solicitante</TableCell>
                                <TableCell width="14%">Modo</TableCell>
                                <TableCell width="18%">Fecha solicitud</TableCell>
                                <TableCell width="10%" align="center">Pendientes</TableCell>
                                <TableCell width="10%" align="center">Estado</TableCell>
                                <TableCell width="6%" align="center">Ver</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow><TableCell colSpan={8} align="center">Cargando…</TableCell></TableRow>
                            ) : resultados.length === 0 ? (
                                <TableRow><TableCell colSpan={8} align="center">Sin resultados</TableCell></TableRow>
                            ) : resultados.map((r) => (
                                <TableRow key={r.id} hover>
                                    <TableCell>{r.id}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{r.tipoDocumento}</Typography>
                                        <Typography variant="caption" color="text.secondary">#{r.documentoId}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{r.solicitanteNombre}</Typography>
                                        <Typography variant="caption" color="text.secondary">{r.solicitanteUsername}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{r.modoAprobacion}</Typography>
                                    </TableCell>
                                    <TableCell>{formatDateTimeForUi(r.fechaSolicitud)}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={`${r.pendientes}/${r.totalAprobadores}`}
                                            color={r.pendientes > 0 ? "warning" : "default"} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={ESTADO_APROBACION_LABEL[r.estadoId]}
                                            color={ESTADO_APROBACION_COLOR[r.estadoId]}
                                            size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => handleVerDetalle(r.id)}>Ver</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* ── Dialog detalle ──────────────────────────────────────── */}
            <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Detalle de aprobación #{aprobacionActual?.id}
                    {aprobacionActual && (
                        <Chip sx={{ ml: 1 }}
                            label={ESTADO_APROBACION_LABEL[aprobacionActual.estadoId]}
                            color={ESTADO_APROBACION_COLOR[aprobacionActual.estadoId]}
                            size="small" />
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {aprobacionActual && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Tipo documento</Typography>
                                    <Typography variant="body2" fontWeight={600}>{aprobacionActual.tipoDocumento}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Documento ID</Typography>
                                    <Typography variant="body2" fontWeight={600}>#{aprobacionActual.documentoId}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Solicitante</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {aprobacionActual.solicitante.nombre}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Modo</Typography>
                                    <Typography variant="body2" fontWeight={600}>{aprobacionActual.modoAprobacion}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Fecha solicitud</Typography>
                                    <Typography variant="body2">{formatDateTimeForUi(aprobacionActual.fechaSolicitud)}</Typography>
                                </Grid>
                                {aprobacionActual.fechaResolucion && (
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Fecha resolución</Typography>
                                        <Typography variant="body2">{formatDateTimeForUi(aprobacionActual.fechaResolucion)}</Typography>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Aprobadores</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ "& th": { bgcolor: "#525C71", color: "#fff", fontWeight: 600 } }}>
                                        <TableRow>
                                            <TableCell width="8%">Nivel</TableCell>
                                            <TableCell width="30%">Aprobador</TableCell>
                                            <TableCell width="15%" align="center">Tipo</TableCell>
                                            <TableCell width="15%" align="center">Estado</TableCell>
                                            <TableCell width="20%">Comentario</TableCell>
                                            <TableCell width="12%">Fecha resp.</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {aprobacionActual.detalle
                                            .slice()
                                            .sort((a, b) => a.nivel - b.nivel)
                                            .map((det) => (
                                                <TableRow key={det.id}>
                                                    <TableCell>{det.nivel}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{det.aprobador.nombre}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{det.aprobador.username}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {det.esManager && <Chip label="Manager" size="small" variant="outlined" />}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={ESTADO_APROBACION_LABEL[det.estadoId]}
                                                            color={ESTADO_APROBACION_COLOR[det.estadoId]}
                                                            size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                            {det.comentario ?? "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {det.fechaRespuesta ? formatDateTimeForUi(det.fechaRespuesta) : "—"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setDetalleOpen(false)}
                        sx={{ bgcolor: "#5F5271", "&:hover": { bgcolor: "#4a3f5a" } }}>
                        Cerrar
                    </Button>
                    {aprobacionActual?.estadoId === "PEN" && (
                        <>
                            <Button variant="contained" startIcon={<CancelIcon />}
                                onClick={() => abrirRespuesta("REC")}
                                sx={{ bgcolor: "#71526B", "&:hover": { bgcolor: "#5a3f55" } }}>
                                Rechazar
                            </Button>
                            <Button variant="contained" startIcon={<CheckCircleIcon />}
                                onClick={() => abrirRespuesta("APR")}
                                sx={{ bgcolor: "#527158", "&:hover": { bgcolor: "#3d5542" } }}>
                                Aprobar
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* ── Dialog confirmar respuesta ──────────────────────────── */}
            <Dialog open={respuestaOpen} onClose={() => setRespuestaOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {decision === "APR" ? "Confirmar aprobación" : "Confirmar rechazo"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label={decision === "REC" ? "Motivo del rechazo (requerido)" : "Comentario (opcional)"}
                        multiline rows={3} fullWidth size="small" sx={{ mt: 1 }}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        required={decision === "REC"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setRespuestaOpen(false)} disabled={procesando}
                        sx={{ bgcolor: "#5F5271", "&:hover": { bgcolor: "#4a3f5a" } }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        disabled={procesando}
                        onClick={confirmarRespuesta}
                        sx={{
                            bgcolor: decision === "APR" ? "#527158" : "#71526B",
                            "&:hover": { bgcolor: decision === "APR" ? "#3d5542" : "#5a3f55" },
                        }}>
                        {procesando ? "Procesando…" : decision === "APR" ? "Aprobar" : "Rechazar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default AprobacionBandejaView;
