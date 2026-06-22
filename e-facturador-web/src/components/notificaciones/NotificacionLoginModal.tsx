import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { SgNotificacionDTO, getNotificacionesLogin, marcarVisto } from "../../apis/SgNotificacionController";

const tipoColor: Record<string, "error" | "warning" | "info" | "default"> = {
    COBRO_VENCIDO: "error",
    VENCIMIENTO: "error",
    STOCK_BAJO: "warning",
    APROBACION_PENDIENTE: "info",
    REQUISICION_PENDIENTE: "info",
};

interface Props {
    open: boolean;
    onClose: () => void;
}

const NotificacionLoginModal: React.FC<Props> = ({ open, onClose }) => {
    const [notificaciones, setNotificaciones] = useState<SgNotificacionDTO[]>([]);
    const [cargando, setCargando] = useState(false);
    const [paso, setPaso] = useState(0);
    // Rastreo individual: cuáles ya fueron confirmadas en esta sesión
    const [confirmados, setConfirmados] = useState<Set<number>>(new Set());
    const [confirmando, setConfirmando] = useState(false);

    useEffect(() => {
        if (!open) return;
        setPaso(0);
        setConfirmados(new Set());
        setCargando(true);
        getNotificacionesLogin()
            .then(setNotificaciones)
            .catch(() => setNotificaciones([]))
            .finally(() => setCargando(false));
    }, [open]);

    const total = notificaciones.length;
    const actual = notificaciones[paso] ?? null;
    const estaConfirmado = actual ? confirmados.has(actual.id) : false;
    const todosConfirmados = total > 0 && confirmados.size === total;
    const progreso = total > 0 ? (confirmados.size / total) * 100 : 0;

    const handleConfirmarActual = async () => {
        if (!actual || estaConfirmado) return;
        setConfirmando(true);
        try {
            await marcarVisto(actual.id);
            setConfirmados((prev) => new Set(Array.from(prev).concat(actual.id)));
            // Avanzar automáticamente si hay siguiente
            if (paso < total - 1) setPaso((p) => p + 1);
        } finally {
            setConfirmando(false);
        }
    };

    const handleCerrar = () => {
        // Solo permitir cerrar si todos están confirmados o si no hay ninguno
        if (todosConfirmados || total === 0) onClose();
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            onClose={handleCerrar}
        >
            {/* Cabecera */}
            <DialogTitle
                sx={{
                    bgcolor: "#272C36",
                    color: "#fff",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 1,
                }}
            >
                <span>Avisos pendientes</span>
                {total > 0 && (
                    <Chip
                        label={`${paso + 1} / ${total}`}
                        size="small"
                        sx={{ bgcolor: "#848EA5", color: "#fff", fontWeight: 700 }}
                    />
                )}
            </DialogTitle>

            {/* Barra de progreso */}
            {total > 0 && (
                <LinearProgress
                    variant="determinate"
                    value={progreso}
                    sx={{ height: 4, bgcolor: "#e0e0e0", "& .MuiLinearProgress-bar": { bgcolor: "#526671" } }}
                />
            )}

            <DialogContent sx={{ p: 0, minHeight: 180 }}>
                {cargando ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : total === 0 ? (
                    <Box px={3} py={4} textAlign="center">
                        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No hay avisos pendientes.
                        </Typography>
                    </Box>
                ) : actual ? (
                    <Box px={3} py={3}>
                        {/* Tipo + confirmado */}
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <Chip
                                label={actual.tipo.replace(/_/g, " ")}
                                color={tipoColor[actual.tipo] ?? "default"}
                                size="small"
                            />
                            {estaConfirmado && (
                                <Chip
                                    label="Leído"
                                    size="small"
                                    icon={<CheckCircleOutlineIcon />}
                                    sx={{ bgcolor: "#e8f5e9", color: "success.dark" }}
                                />
                            )}
                        </Box>

                        {/* Título */}
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            {actual.titulo}
                        </Typography>

                        {/* Descripción */}
                        {actual.descripcion && (
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                                {actual.descripcion}
                            </Typography>
                        )}

                        {/* Módulo */}
                        <Box mt={2}>
                            <Typography variant="caption" color="text.disabled">
                                Módulo: {actual.modulo}
                                {actual.fechaReg && (
                                    <> · {new Date(actual.fechaReg).toLocaleDateString("es-DO")}</>
                                )}
                            </Typography>
                        </Box>

                        <Divider sx={{ mt: 2 }} />

                        {/* Indicadores de paso */}
                        <Box display="flex" justifyContent="center" gap={0.75} mt={1.5}>
                            {notificaciones.map((n, idx) => (
                                <Box
                                    key={n.id}
                                    onClick={() => setPaso(idx)}
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        bgcolor:
                                            confirmados.has(n.id)
                                                ? "success.main"
                                                : idx === paso
                                                ? "#526671"
                                                : "#bdbdbd",
                                        transition: "background-color 0.2s",
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
                {/* Navegación */}
                <Button
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setPaso((p) => Math.max(0, p - 1))}
                    disabled={cargando || paso === 0 || total === 0}
                    variant="outlined"
                    sx={{ flex: "0 0 auto" }}
                >
                    Anterior
                </Button>

                <Box sx={{ flex: 1 }} />

                {/* Acción principal */}
                {!todosConfirmados ? (
                    <>
                        {!estaConfirmado && actual && (
                            <Button
                                variant="contained"
                                onClick={handleConfirmarActual}
                                disabled={confirmando || cargando}
                                sx={{ bgcolor: "#526671", "&:hover": { bgcolor: "#3d4f58" } }}
                            >
                                {confirmando ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    "Entendido"
                                )}
                            </Button>
                        )}

                        {paso < total - 1 && (
                            <Button
                                size="small"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => setPaso((p) => p + 1)}
                                disabled={cargando}
                                variant={estaConfirmado ? "contained" : "outlined"}
                                sx={estaConfirmado ? { bgcolor: "#526671", "&:hover": { bgcolor: "#3d4f58" } } : {}}
                            >
                                Siguiente
                            </Button>
                        )}
                    </>
                ) : (
                    <Button
                        variant="contained"
                        onClick={onClose}
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
                    >
                        Todos leídos — Continuar
                    </Button>
                )}
            </DialogActions>

            {/* Aviso de confirmación obligatoria */}
            {!todosConfirmados && total > 0 && !cargando && (
                <Box px={3} pb={2}>
                    <Alert severity="warning" sx={{ py: 0 }}>
                        Debe confirmar todos los avisos para continuar ({confirmados.size}/{total} leídos).
                    </Alert>
                </Box>
            )}
        </Dialog>
    );
};

export default NotificacionLoginModal;
