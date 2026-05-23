import { useEffect, useState } from "react";
import {
    Box, Chip, CircularProgress, Divider, IconButton,
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, ToggleButton, ToggleButtonGroup,
    Tooltip, Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
    SgNotificacionDTO,
    cerrarNotificacion,
    getNotificaciones,
    marcarVisto,
} from "../../apis/SgNotificacionController";

// ── helpers de presentación ────────────────────────────────────────────────────

const moduloColor: Record<string, "primary" | "secondary" | "success" | "info"> = {
    INVENTARIO: "primary",
    COMPRAS: "secondary",
    APROBACIONES: "success",
};

const tipoColor: Record<string, "error" | "warning" | "info" | "default"> = {
    VENCIMIENTO: "error",
    STOCK_BAJO: "warning",
    APROBACION_PENDIENTE: "info",
    LIMITE_PRODUCTO: "warning",
};

const MODULOS = ["TODOS", "INVENTARIO", "COMPRAS", "APROBACIONES"];

export default function NotificacionesView() {
    const [notificaciones, setNotificaciones] = useState<SgNotificacionDTO[]>([]);
    const [moduloFiltro, setModuloFiltro] = useState("TODOS");
    const [cargando, setCargando] = useState(true);

    const cargar = () => {
        setCargando(true);
        getNotificaciones()
            .then(setNotificaciones)
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, []);

    const handleVisto = (id: number) => {
        marcarVisto(id).then(() =>
            setNotificaciones((prev) =>
                prev.map((n) => (n.id === id ? { ...n, visto: true } : n))
            )
        );
    };

    const handleCerrar = (id: number) => {
        cerrarNotificacion(id).then(() =>
            setNotificaciones((prev) => prev.filter((n) => n.id !== id))
        );
    };

    const handleMarcarTodasVistas = () => {
        const noVistas = filtradas.filter((n) => !n.visto);
        Promise.all(noVistas.map((n) => marcarVisto(n.id))).then(() =>
            setNotificaciones((prev) =>
                prev.map((n) =>
                    noVistas.some((nv) => nv.id === n.id) ? { ...n, visto: true } : n
                )
            )
        );
    };

    const filtradas =
        moduloFiltro === "TODOS"
            ? notificaciones
            : notificaciones.filter((n) => n.modulo === moduloFiltro);

    const noVistas = filtradas.filter((n) => !n.visto).length;

    return (
        <Box p={2}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">Notificaciones</Typography>
                    {noVistas > 0 && (
                        <Chip label={`${noVistas} sin ver`} color="error" size="small" />
                    )}
                </Box>
                {noVistas > 0 && (
                    <Tooltip title="Marcar todas como vistas">
                        <IconButton size="small" onClick={handleMarcarTodasVistas}>
                            <DoneAllIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Filtros por módulo */}
            <ToggleButtonGroup
                value={moduloFiltro}
                exclusive
                onChange={(_, v) => v && setModuloFiltro(v)}
                size="small"
                sx={{ mb: 2 }}
            >
                {MODULOS.map((m) => (
                    <ToggleButton key={m} value={m}>
                        {m === "TODOS" ? "Todos" : m.charAt(0) + m.slice(1).toLowerCase()}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <Divider sx={{ mb: 2 }} />

            {cargando ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : filtradas.length === 0 ? (
                <Typography color="text.secondary">No hay notificaciones activas.</Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell>Módulo</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Título</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell align="center">Vista</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtradas.map((n) => (
                                <TableRow
                                    key={n.id}
                                    sx={{
                                        backgroundColor: n.visto ? "inherit" : "#fff8e1",
                                        opacity: n.visto ? 0.75 : 1,
                                    }}
                                >
                                    <TableCell>
                                        <Chip
                                            label={n.modulo}
                                            color={moduloColor[n.modulo] ?? "default"}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={n.tipo.replace("_", " ")}
                                            color={tipoColor[n.tipo] ?? "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: n.visto ? "normal" : 600 }}>
                                        {n.titulo}
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" noWrap title={n.descripcion}>
                                            {n.descripcion ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                        {new Date(n.fechaReg).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        {n.visto ? (
                                            <CheckCircleOutlineIcon color="success" fontSize="small" />
                                        ) : (
                                            <Tooltip title="Marcar como vista">
                                                <IconButton size="small" onClick={() => handleVisto(n.id)}>
                                                    <CheckCircleOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Cerrar notificación">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleCerrar(n.id)}
                                            >
                                                <CancelOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
