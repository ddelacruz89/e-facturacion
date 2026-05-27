import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ActionBar from "../../customers/ActionBar";
import { getStockCritico, InStockCriticoDTO } from "../../apis/InStockArbolController";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtNum = (v: number | undefined | null) =>
    v == null ? "0" : v.toLocaleString("en-US");

// ── componente ────────────────────────────────────────────────────────────────

const StockCriticoView: React.FC = () => {
    const [rows, setRows] = useState<InStockCriticoDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");

    const mountDone = useRef(false);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getStockCritico();
            setRows(data);
        } catch {
            setSnackMsg("Error al consultar el stock crítico.");
            setSnackOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (mountDone.current) return;
        mountDone.current = true;
        cargar();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const urgentes = rows.filter((r) => r.faltante >= (r.limite ?? 0) * 0.5);

    return (
        <>
            <ActionBar title="Stock Crítico — Bajo Límite Mínimo">
                <Button
                    size="small"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
                    onClick={cargar}
                    disabled={loading}
                    sx={{ bgcolor: "#525C71", "&:hover": { bgcolor: "#3D4453" } }}
                >
                    Actualizar
                </Button>
            </ActionBar>

            {/* Resumen */}
            <Box sx={{ display: "flex", gap: 2, mx: 2.5, mt: 2 }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minWidth: 200,
                        bgcolor: rows.length > 0 ? "#fff3e0" : "#f1f8e9",
                        borderColor: rows.length > 0 ? "#ffb74d" : "#aed581",
                    }}
                >
                    <WarningAmberIcon
                        sx={{ color: rows.length > 0 ? "#e65100" : "#558b2f", fontSize: 32 }}
                    />
                    <Box>
                        <Typography variant="h5" fontWeight={700} color={rows.length > 0 ? "#e65100" : "#558b2f"}>
                            {rows.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            producto-almacén bajo límite
                        </Typography>
                    </Box>
                </Paper>

                {urgentes.length > 0 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            minWidth: 200,
                            bgcolor: "#ffebee",
                            borderColor: "#ef9a9a",
                        }}
                    >
                        <WarningAmberIcon sx={{ color: "#c62828", fontSize: 32 }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#c62828">
                                {urgentes.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                críticos (&ge;50% bajo límite)
                            </Typography>
                        </Box>
                    </Paper>
                )}
            </Box>

            {/* Tabla */}
            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, overflow: "hidden" }}>
                <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Productos con stock por debajo del límite mínimo
                    </Typography>
                    {loading && <CircularProgress size={16} />}
                </Box>
                <Divider />

                <TableContainer sx={{ maxHeight: 520 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "#272C36", color: "#fff", width: "30%" }}>
                                    Producto
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "#272C36", color: "#fff", width: "22%" }}>
                                    Almacén
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#272C36", color: "#fff", width: "14%" }}>
                                    Stock actual
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#272C36", color: "#fff", width: "12%" }}>
                                    Límite
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#272C36", color: "#fff", width: "12%" }}>
                                    Faltante
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#272C36", color: "#fff", width: "10%" }}>
                                    Severidad
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                        No hay productos con stock por debajo del límite mínimo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((r, idx) => {
                                    const pct = r.limite > 0 ? r.faltante / r.limite : 0;
                                    const critico = pct >= 0.5;
                                    return (
                                        <TableRow
                                            key={`${r.productoId}-${r.almacenId}-${idx}`}
                                            hover
                                            sx={{ bgcolor: critico ? "#fff8f8" : "inherit" }}
                                        >
                                            <TableCell sx={{ fontWeight: critico ? 700 : 400 }}>
                                                {r.productoNombre}
                                            </TableCell>
                                            <TableCell sx={{ color: "text.secondary" }}>
                                                {r.almacenNombre}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color="#c62828"
                                                >
                                                    {fmtNum(r.cantidadActual)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" color="text.secondary">
                                                    {fmtNum(r.limite)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={`Hay que reponer ${fmtNum(r.faltante)} unidades`}>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={700}
                                                        color={critico ? "#c62828" : "#e65100"}
                                                    >
                                                        {fmtNum(r.faltante)}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="center">
                                                {critico ? (
                                                    <Chip
                                                        label="Crítico"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#ffebee",
                                                            color: "#c62828",
                                                            border: "1px solid #ef9a9a",
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Bajo"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#fff3e0",
                                                            color: "#e65100",
                                                            border: "1px solid #ffb74d",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="error" onClose={() => setSnackOpen(false)}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default StockCriticoView;
