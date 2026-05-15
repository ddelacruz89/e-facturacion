import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MovimientoTipoSelect from "../shared/MovimientoTipoSelect";
import {
    buscarAjustes,
    getAjuste,
    InAjusteInventario,
    InAjusteInventarioResumenDTO,
    InAjusteInventarioSearchCriteria,
    PageResponse,
} from "../../apis/InAjusteInventarioController";

// ── helpers ───────────────────────────────────────────────────────────────────

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

const defaultFechaInicio = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toIsoDate(d);
};

const fmtFecha = (v?: string) => {
    if (!v) return "—";
    return new Date(v).toLocaleString("es-DO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const ESTADO_OPCIONES = [
    { value: "", label: "Todos" },
    { value: "APL", label: "Aplicado" },
    { value: "ANU", label: "Anulado" },
];

const PAGE_SIZE = 15;

// ── types ─────────────────────────────────────────────────────────────────────

interface Props {
    open: boolean;
    onClose: () => void;
}

// ── component ─────────────────────────────────────────────────────────────────

const AjusteBuscarModal: React.FC<Props> = ({ open, onClose }) => {
    // ── filtros ──
    const [fechaInicio, setFechaInicio] = useState(defaultFechaInicio());
    const [fechaFin, setFechaFin] = useState(toIsoDate(new Date()));
    const [usuarioReg, setUsuarioReg] = useState("");
    const [estadoId, setEstadoId] = useState("");
    const [movimientoTipoId, setMovimientoTipoId] = useState<number | "">("");

    // ── resultados ──
    const [resultado, setResultado] = useState<PageResponse<InAjusteInventarioResumenDTO> | null>(null);
    const [cargando, setCargando] = useState(false);
    const [page, setPage] = useState(0);

    // ── detalle (click en fila) ──
    const [ajusteDetalle, setAjusteDetalle] = useState<InAjusteInventario | null>(null);
    const [resumenDetalle, setResumenDetalle] = useState<InAjusteInventarioResumenDTO | null>(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    const buscar = useCallback(async (p = 0) => {
        setCargando(true);
        try {
            const criteria: InAjusteInventarioSearchCriteria = {
                fechaInicio: fechaInicio || undefined,
                fechaFin: fechaFin || undefined,
                usuarioReg: usuarioReg.trim() || undefined,
                estadoId: estadoId || undefined,
                movimientoTipoId: movimientoTipoId !== "" ? (movimientoTipoId as number) : undefined,
                page: p,
                size: PAGE_SIZE,
            };
            const data = await buscarAjustes(criteria);
            setResultado(data);
            setPage(p);
        } catch {
            setResultado(null);
        } finally {
            setCargando(false);
        }
    }, [fechaInicio, fechaFin, usuarioReg, estadoId, movimientoTipoId]);

    // Cargar al abrir con defaults
    useEffect(() => {
        if (open) buscar(0);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRowClick = async (resumen: InAjusteInventarioResumenDTO) => {
        setLoadingDetalle(true);
        setResumenDetalle(resumen);
        try {
            const detalle = await getAjuste(resumen.id);
            setAjusteDetalle(detalle);
        } catch {
            setAjusteDetalle(null);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleCloseDetalle = () => {
        setAjusteDetalle(null);
        setResumenDetalle(null);
    };

    const handleReset = () => {
        setFechaInicio(defaultFechaInicio());
        setFechaFin(toIsoDate(new Date()));
        setUsuarioReg("");
        setEstadoId("");
        setMovimientoTipoId("");
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        buscar(value - 1);
    };

    const estadoChip = (estado: string) => {
        if (estado === "APL") return <Chip label="Aplicado" color="success" size="small" />;
        if (estado === "ANU") return <Chip label="Anulado" color="error" size="small" />;
        return <Chip label={estado} size="small" />;
    };

    return (
        <>
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Buscar Ajustes de Inventario</Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {/* ── Filtros ─────────────────────────────────────────────── */}
                <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel shrink>Fecha inicio</InputLabel>
                            <OutlinedInput
                                type="date"
                                notched
                                label="Fecha inicio"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                inputProps={{ max: fechaFin || undefined }}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel shrink>Fecha fin</InputLabel>
                            <OutlinedInput
                                type="date"
                                notched
                                label="Fecha fin"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                inputProps={{ min: fechaInicio || undefined }}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Usuario</InputLabel>
                            <OutlinedInput
                                label="Usuario"
                                value={usuarioReg}
                                onChange={(e) => setUsuarioReg(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscar(0)}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label="Estado"
                                value={estadoId}
                                onChange={(e) => setEstadoId(e.target.value)}
                            >
                                {ESTADO_OPCIONES.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <MovimientoTipoSelect
                            modulo="AI"
                            value={movimientoTipoId}
                            onChange={setMovimientoTipoId}
                            label="Motivo"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: "auto" }} sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Limpiar filtros">
                            <IconButton size="small" onClick={handleReset} color="default">
                                <RestartAltIcon />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={cargando ? <CircularProgress size={14} color="inherit" /> : <SearchIcon />}
                            onClick={() => buscar(0)}
                            disabled={cargando}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>

                {/* ── Tabla de resultados ──────────────────────────────────── */}
                <TableContainer sx={{ maxHeight: 420, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Motivo</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Usuario</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Líneas</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Observación</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : !resultado || resultado.content.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No se encontraron ajustes con los filtros indicados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resultado.content.map((r) => (
                                    <TableRow
                                        key={r.id}
                                        hover
                                        onClick={() => handleRowClick(r)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{r.id}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtFecha(r.fechaReg)}</TableCell>
                                        <TableCell>{r.movimientoTipoNombre ?? "—"}</TableCell>
                                        <TableCell>{r.usuarioReg}</TableCell>
                                        <TableCell align="center">{r.totalLineas}</TableCell>
                                        <TableCell>{estadoChip(r.estadoId)}</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontStyle: r.observacion ? undefined : "italic" }}>
                                            {r.observacion || "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ── Paginación ───────────────────────────────────────────── */}
                {resultado && resultado.totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {resultado.totalElements} resultado{resultado.totalElements !== 1 ? "s" : ""}
                        </Typography>
                        <Pagination
                            count={resultado.totalPages}
                            page={page + 1}
                            onChange={handlePageChange}
                            size="small"
                            color="primary"
                        />
                    </Box>
                )}
                {resultado && resultado.totalPages <= 1 && resultado.totalElements > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        {resultado.totalElements} resultado{resultado.totalElements !== 1 ? "s" : ""}
                    </Typography>
                )}
            </DialogContent>
        </Dialog>

        {/* ── Dialog de detalle (solo lectura) ───────────────────────────────── */}
        <Dialog
            open={!!ajusteDetalle || loadingDetalle}
            onClose={handleCloseDetalle}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                <IconButton size="small" onClick={handleCloseDetalle}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                    Ajuste #{resumenDetalle?.id ?? ""}
                </Typography>
                <IconButton size="small" onClick={handleCloseDetalle}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {loadingDetalle ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : ajusteDetalle ? (
                    <>
                        {/* ── Encabezado ───────────────────────────────────── */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                        label="ID"
                                        value={ajusteDetalle.id}
                                        size="small"
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                    <TextField
                                        label="Fecha"
                                        value={fmtFecha(ajusteDetalle.fechaReg)}
                                        size="small"
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <TextField
                                        label="Almacén"
                                        value={ajusteDetalle.almacenId}
                                        size="small"
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                        label="Estado"
                                        value={ajusteDetalle.estadoId === "APL" ? "Aplicado" : ajusteDetalle.estadoId === "ANU" ? "Anulado" : ajusteDetalle.estadoId}
                                        size="small"
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Motivo"
                                        value={resumenDetalle?.movimientoTipoNombre ?? "—"}
                                        size="small"
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Usuario"
                                        value={ajusteDetalle.usuarioReg}
                                        size="small"
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Justificación"
                                        value={ajusteDetalle.observacion || "—"}
                                        size="small"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* ── Detalle de productos ─────────────────────────── */}
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                            Líneas del ajuste ({ajusteDetalle.detalles?.length ?? 0})
                        </Typography>
                        <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Producto ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Lote</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Stock anterior</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Stock nuevo</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Diferencia</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(ajusteDetalle.detalles ?? []).map((d, idx) => (
                                        <TableRow key={d.id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{d.productoId}</TableCell>
                                            <TableCell sx={{ color: d.lote ? undefined : "text.secondary", fontStyle: d.lote ? undefined : "italic" }}>
                                                {d.lote || "Sin lote"}
                                            </TableCell>
                                            <TableCell align="right">{d.cantidadActual}</TableCell>
                                            <TableCell align="right">{d.cantidadNueva}</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ fontWeight: 600, color: d.diferencia > 0 ? "success.main" : d.diferencia < 0 ? "error.main" : "text.secondary" }}
                                            >
                                                {d.diferencia > 0 ? `+${d.diferencia}` : d.diferencia}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    </>
    );
};

export default AjusteBuscarModal;
