import { useEffect, useState } from "react";
import {
    Box,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {
    InAlertaDTO,
    cerrarAlerta,
    getAlertasActivas,
    marcarVisto,
} from "../../apis/InAlertaController";

type TipoFiltro = "TODOS" | "VENCIMIENTO" | "STOCK_BAJO";

const tipoLabel: Record<string, { label: string; color: "error" | "warning" }> = {
    VENCIMIENTO: { label: "Vencimiento", color: "error" },
    STOCK_BAJO: { label: "Stock bajo", color: "warning" },
};

export default function AlertasView() {
    const [alertas, setAlertas] = useState<InAlertaDTO[]>([]);
    const [filtro, setFiltro] = useState<TipoFiltro>("TODOS");
    const [cargando, setCargando] = useState(true);

    const cargar = () => {
        setCargando(true);
        getAlertasActivas()
            .then(setAlertas)
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, []);

    const handleVisto = (id: number) => {
        marcarVisto(id).then(() =>
            setAlertas((prev) =>
                prev.map((a) => (a.id === id ? { ...a, visto: true } : a))
            )
        );
    };

    const handleCerrar = (id: number) => {
        cerrarAlerta(id).then(() =>
            setAlertas((prev) => prev.filter((a) => a.id !== id))
        );
    };

    const alertasFiltradas =
        filtro === "TODOS" ? alertas : alertas.filter((a) => a.tipo === filtro);

    const noVistas = alertas.filter((a) => !a.visto).length;

    return (
        <Box p={2}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">Alertas de Inventario</Typography>
                {noVistas > 0 && (
                    <Chip label={`${noVistas} sin ver`} color="error" size="small" />
                )}
            </Box>

            {/* Filtros por tipo */}
            <Box display="flex" gap={1} mb={2}>
                {(["TODOS", "VENCIMIENTO", "STOCK_BAJO"] as TipoFiltro[]).map((t) => (
                    <Chip
                        key={t}
                        label={t === "TODOS" ? "Todos" : tipoLabel[t].label}
                        variant={filtro === t ? "filled" : "outlined"}
                        color={t === "TODOS" ? "default" : tipoLabel[t].color}
                        onClick={() => setFiltro(t)}
                        clickable
                    />
                ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {cargando ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : alertasFiltradas.length === 0 ? (
                <Typography color="text.secondary">No hay alertas activas.</Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Lote</TableCell>
                                <TableCell>Producto ID</TableCell>
                                <TableCell>Detalle</TableCell>
                                <TableCell>Fecha registro</TableCell>
                                <TableCell align="center">Vista</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {alertasFiltradas.map((a) => (
                                <TableRow
                                    key={a.id}
                                    sx={{
                                        backgroundColor: a.visto ? "inherit" : "#fff8e1",
                                        opacity: a.visto ? 0.75 : 1,
                                    }}
                                >
                                    <TableCell>
                                        <Chip
                                            label={tipoLabel[a.tipo]?.label ?? a.tipo}
                                            color={tipoLabel[a.tipo]?.color ?? "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{a.lote ?? "—"}</TableCell>
                                    <TableCell>{a.productoId}</TableCell>
                                    <TableCell>
                                        {a.tipo === "VENCIMIENTO" && a.fechaVencimiento
                                            ? `Vence: ${a.fechaVencimiento}`
                                            : a.tipo === "STOCK_BAJO"
                                            ? `Stock: ${a.cantidadActual} / Límite: ${a.limite}`
                                            : "—"}
                                    </TableCell>
                                    <TableCell>
                                        {a.fechaReg ? new Date(a.fechaReg).toLocaleDateString() : "—"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {a.visto ? (
                                            <CheckCircleOutlineIcon color="success" fontSize="small" />
                                        ) : (
                                            <Tooltip title="Marcar como vista">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleVisto(a.id)}
                                                >
                                                    <CheckCircleOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Cerrar alerta">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleCerrar(a.id)}
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
