import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import ActionBar from "../../customers/ActionBar";
import { getAlmacenesActivos } from "../../apis/AlmacenController";
import { InAlmacen } from "../../models/inventario";
import { ModalSearch } from "../search/ModalSearch";
import { useModalSearch } from "../../hooks/useModalSearch";
import { SearchConfig } from "../../types/modalSearchTypes";
import {
    aplicarAjuste,
    getStockActual,
    getLotesDisponibles,
    getHistorialAjustes,
    InAjusteDetalleRequest,
    InAjusteInventarioResumenDTO,
    InStockActualDTO,
} from "../../apis/InAjusteInventarioController";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtFecha = (v?: string) => {
    if (!v) return "—";
    return new Date(v).toLocaleString("es-DO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const fmtNum = (v?: number) => {
    if (v === undefined || v === null) return "—";
    return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const SIN_LOTE = "__SIN_LOTE__";

// ── types ─────────────────────────────────────────────────────────────────────

interface LineaAjuste {
    productoId: number;
    productoNombre: string;
    lote: string; // "" = sin lote
    cantidadActual: number;
    cantidadNueva: string;
    stockCargado: boolean;
}

type Vista = "ajuste" | "historial";

// ── component ─────────────────────────────────────────────────────────────────

const AjusteInventarioView: React.FC = () => {
    // ── vista ──
    const [vista, setVista] = useState<Vista>("ajuste");

    // ── catálogos ──
    const [almacenes, setAlmacenes] = useState<InAlmacen[]>([]);

    // ── cabecera del ajuste ──
    const [almacenId, setAlmacenId] = useState<number | "">("");
    const [observacion, setObservacion] = useState("");

    // ── producto seleccionado para agregar ──
    const [productoSel, setProductoSel] = useState<{ id: number; nombreProducto: string } | null>(null);
    const [lotesDisponibles, setLotesDisponibles] = useState<(string | null)[]>([]);
    const [loteSeleccionado, setLoteSeleccionado] = useState<string>("");
    const [cargandoLotes, setCargandoLotes] = useState(false);
    const [cargandoStock, setCargandoStock] = useState(false);

    // ── líneas del ajuste ──
    const [lineas, setLineas] = useState<LineaAjuste[]>([]);

    // ── historial ──
    const [historial, setHistorial] = useState<InAjusteInventarioResumenDTO[]>([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    // ── feedback ──
    const [guardando, setGuardando] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

    // ── modal de búsqueda de producto ──
    const search = useModalSearch();

    // Config del modal — se regenera cuando cambia almacenId
    const productoConfig = useMemo((): SearchConfig => ({
        title: "Buscar Producto en Almacén",
        endpoint: "/api/producto/search/almacen",
        keyField: "id",
        searchOnLoad: false,
        fields: [
            { key: "nombre", label: "Nombre", type: "text" as const, placeholder: "Nombre del producto" },
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "15%" },
            { key: "nombreProducto", label: "Nombre", width: "85%" },
        ],
        defaultParams: { almacenId: almacenId || undefined },
    }), [almacenId]);

    // ── cargar almacenes ──
    useEffect(() => {
        getAlmacenesActivos().then(setAlmacenes).catch(() => {});
    }, []);

    // ── cuando cambia el almacén, resetear selección ──
    useEffect(() => {
        setProductoSel(null);
        setLotesDisponibles([]);
        setLoteSeleccionado("");
        setLineas([]);
    }, [almacenId]);

    // ── cargar lotes cuando se selecciona un producto ──
    useEffect(() => {
        if (!productoSel || !almacenId) {
            setLotesDisponibles([]);
            setLoteSeleccionado("");
            return;
        }
        setCargandoLotes(true);
        getLotesDisponibles(productoSel.id, almacenId as number)
            .then((lotes) => {
                setLotesDisponibles(lotes);
                // Pre-seleccionar si solo hay una opción
                if (lotes.length === 1) {
                    setLoteSeleccionado(lotes[0] === null ? SIN_LOTE : lotes[0]);
                } else {
                    setLoteSeleccionado("");
                }
            })
            .catch(() => setLotesDisponibles([]))
            .finally(() => setCargandoLotes(false));
    }, [productoSel, almacenId]);

    // ── cargar historial ──
    useEffect(() => {
        if (vista === "historial" && almacenId) {
            setCargandoHistorial(true);
            getHistorialAjustes(almacenId as number)
                .then(setHistorial)
                .catch(() => showSnack("Error al cargar el historial", "error"))
                .finally(() => setCargandoHistorial(false));
        }
    }, [vista, almacenId]);

    // ── helpers UI ──

    const showSnack = (msg: string, severity: "success" | "error" = "success") => {
        setSnackMsg(msg);
        setSnackSeverity(severity);
        setSnackOpen(true);
    };

    const handleProductoSelect = search.handleSelect((item: any) => {
        setProductoSel({ id: item.id, nombreProducto: item.nombreProducto });
        setLoteSeleccionado("");
    });

    const handleAgregarLinea = async () => {
        if (!almacenId) { showSnack("Seleccione un almacén primero", "error"); return; }
        if (!productoSel) { showSnack("Seleccione un producto", "error"); return; }
        if (!loteSeleccionado) { showSnack("Seleccione un lote (o 'Sin lote')", "error"); return; }

        const loteReal = loteSeleccionado === SIN_LOTE ? "" : loteSeleccionado;

        const yaExiste = lineas.some(
            (l) => l.productoId === productoSel.id && l.lote === loteReal
        );
        if (yaExiste) {
            showSnack("Ese producto/lote ya está en la lista", "error");
            return;
        }

        setCargandoStock(true);
        try {
            const stock: InStockActualDTO = await getStockActual(
                productoSel.id,
                almacenId as number,
                loteReal || undefined
            );

            setLineas((prev) => [
                ...prev,
                {
                    productoId: stock.productoId,
                    productoNombre: stock.productoNombre,
                    lote: loteReal,
                    cantidadActual: Math.round(stock.cantidad),
                    cantidadNueva: String(Math.round(stock.cantidad)),
                    stockCargado: true,
                },
            ]);

            // Reset selección
            setProductoSel(null);
            setLoteSeleccionado("");
            setLotesDisponibles([]);
        } catch {
            showSnack("No se encontró inventario para ese producto/lote en el almacén", "error");
        } finally {
            setCargandoStock(false);
        }
    };

    const handleCantidadNuevaChange = (idx: number, val: string) => {
        setLineas((prev) =>
            prev.map((l, i) => (i === idx ? { ...l, cantidadNueva: val } : l))
        );
    };

    const handleEliminarLinea = (idx: number) => {
        setLineas((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleGuardar = async () => {
        if (!almacenId) { showSnack("Seleccione un almacén", "error"); return; }
        if (!observacion.trim()) { showSnack("Ingrese una observación/motivo del ajuste", "error"); return; }
        if (lineas.length === 0) { showSnack("Agregue al menos un producto", "error"); return; }

        const detalles: InAjusteDetalleRequest[] = lineas.map((l) => ({
            productoId: l.productoId,
            lote: l.lote || undefined,
            cantidadActual: l.cantidadActual,
            cantidadNueva: parseInt(l.cantidadNueva, 10) || 0,
        }));

        setGuardando(true);
        try {
            await aplicarAjuste({
                almacenId: almacenId as number,
                observacion: observacion.trim(),
                detalles,
            });
            showSnack("Ajuste aplicado correctamente", "success");
            setLineas([]);
            setObservacion("");
        } catch {
            showSnack("Error al aplicar el ajuste", "error");
        } finally {
            setGuardando(false);
        }
    };

    // ── color del campo cantidadNueva ──
    const colorLinea = (linea: LineaAjuste) => {
        const nueva = parseInt(linea.cantidadNueva, 10);
        if (isNaN(nueva) || nueva === linea.cantidadActual) return undefined;
        return nueva < linea.cantidadActual ? "#fff8e1" : "#e3f2fd";
    };

    const borderLinea = (linea: LineaAjuste) => {
        const nueva = parseInt(linea.cantidadNueva, 10);
        if (isNaN(nueva) || nueva === linea.cantidadActual) return undefined;
        return nueva < linea.cantidadActual ? "#f9a825" : "#1565c0";
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <ActionBar title="Ajuste de Inventario" />

            {/* ── Selector de almacén + botones de vista ─────────────────── */}
            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Almacén</InputLabel>
                            <Select
                                label="Almacén"
                                value={almacenId}
                                onChange={(e) => setAlmacenId(e.target.value as number)}
                            >
                                {almacenes.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant={vista === "ajuste" ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setVista("ajuste")}
                        >
                            Nuevo Ajuste
                        </Button>
                        <Button
                            variant={vista === "historial" ? "contained" : "outlined"}
                            size="small"
                            startIcon={<HistoryIcon />}
                            onClick={() => setVista("historial")}
                            disabled={!almacenId}
                        >
                            Historial
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* ══════════════════ VISTA: NUEVO AJUSTE ══════════════════════ */}
            {vista === "ajuste" && (
                <>
                    {/* ── Observación ───────────────────────────────────── */}
                    <Paper variant="outlined" sx={{ mx: 2.5, mt: 1.5, p: 2 }}>
                        <TextField
                            label="Observación / Motivo del ajuste"
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            fullWidth
                            size="small"
                            required
                            inputProps={{ maxLength: 500 }}
                        />
                    </Paper>

                    {/* ── Agregar producto ──────────────────────────────── */}
                    <Paper variant="outlined" sx={{ mx: 2.5, mt: 1.5, p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                            Agregar producto
                        </Typography>
                        <Grid container spacing={2} alignItems="flex-end">

                            {/* Input de búsqueda de producto */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth size="small" disabled={!almacenId}>
                                    <InputLabel>Producto</InputLabel>
                                    <OutlinedInput
                                        label="Producto"
                                        value={productoSel?.nombreProducto ?? ""}
                                        readOnly
                                        placeholder={almacenId ? "Haga clic en 🔍 para buscar" : "Seleccione un almacén primero"}
                                        onClick={() => almacenId && search.openModal(productoConfig)}
                                        sx={{ cursor: "pointer", "& input": { cursor: "pointer" } }}
                                        endAdornment={
                                            <IconButton
                                                size="small"
                                                edge="end"
                                                disabled={!almacenId}
                                                onClick={(e) => { e.stopPropagation(); search.openModal(productoConfig); }}
                                            >
                                                <SearchIcon fontSize="small" />
                                            </IconButton>
                                        }
                                    />
                                </FormControl>
                            </Grid>

                            {/* Dropdown de lotes */}
                            <Grid size={{ xs: 12, md: 3 }}>
                                <FormControl fullWidth size="small" disabled={!productoSel || cargandoLotes}>
                                    <InputLabel>
                                        {cargandoLotes ? "Cargando lotes…" : "Lote"}
                                    </InputLabel>
                                    <Select
                                        label={cargandoLotes ? "Cargando lotes…" : "Lote"}
                                        value={loteSeleccionado}
                                        onChange={(e) => setLoteSeleccionado(e.target.value)}
                                    >
                                        {lotesDisponibles.map((l, i) => (
                                            <MenuItem key={i} value={l === null ? SIN_LOTE : l}>
                                                {l === null || l === "" ? "Sin lote" : l}
                                            </MenuItem>
                                        ))}
                                        {lotesDisponibles.length === 0 && productoSel && !cargandoLotes && (
                                            <MenuItem disabled value="">
                                                Sin stock disponible
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Botón agregar */}
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={
                                        cargandoStock ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <AddCircleOutlineIcon />
                                        )
                                    }
                                    onClick={handleAgregarLinea}
                                    disabled={cargandoStock || !productoSel || !loteSeleccionado || !almacenId}
                                    fullWidth
                                    size="small"
                                >
                                    Agregar
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ── Tabla de líneas ──────────────────────────────── */}
                    {lineas.length > 0 && (
                        <Paper variant="outlined" sx={{ mx: 2.5, mt: 1.5, overflow: "hidden" }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "grey.100" }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Lote</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Stock Actual</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Nuevo Stock</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Diferencia</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lineas.map((linea, idx) => {
                                            const nueva = parseInt(linea.cantidadNueva, 10);
                                            const diff = isNaN(nueva) ? null : nueva - linea.cantidadActual;
                                            const bg = colorLinea(linea);
                                            const border = borderLinea(linea);
                                            return (
                                                <TableRow key={idx} hover>
                                                    <TableCell>{linea.productoNombre}</TableCell>
                                                    <TableCell>{linea.lote || "Sin lote"}</TableCell>
                                                    <TableCell align="right">{linea.cantidadActual}</TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>
                                                        <OutlinedInput
                                                            type="number"
                                                            value={linea.cantidadNueva}
                                                            onChange={(e) => handleCantidadNuevaChange(idx, e.target.value)}
                                                            size="small"
                                                            inputProps={{ min: 0, step: "1" }}
                                                            sx={{
                                                                width: 120,
                                                                bgcolor: bg,
                                                                "& .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: border,
                                                                    borderWidth: border ? 2 : undefined,
                                                                },
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            color: diff === null ? undefined : diff < 0 ? "warning.dark" : diff > 0 ? "primary.dark" : "text.secondary",
                                                            fontWeight: diff !== null && diff !== 0 ? 700 : undefined,
                                                        }}
                                                    >
                                                        {diff === null ? "—" : (diff > 0 ? "+" : "") + diff}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 0 }}>
                                                        <Tooltip title="Eliminar línea">
                                                            <IconButton size="small" color="error" onClick={() => handleEliminarLinea(idx)}>
                                                                <DeleteOutlineIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Divider />
                            <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                    onClick={handleGuardar}
                                    disabled={guardando}
                                >
                                    Aplicar Ajuste
                                </Button>
                            </Box>
                        </Paper>
                    )}
                </>
            )}

            {/* ══════════════════ VISTA: HISTORIAL ═════════════════════════ */}
            {vista === "historial" && (
                <Paper variant="outlined" sx={{ mx: 2.5, mt: 1.5, overflow: "hidden" }}>
                    {cargandoHistorial ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "grey.100" }}>
                                        <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Observación</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Líneas</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historial.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                No hay ajustes registrados para este almacén
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        historial.map((h) => (
                                            <TableRow key={h.id} hover>
                                                <TableCell>{h.id}</TableCell>
                                                <TableCell>{fmtFecha(h.fechaReg)}</TableCell>
                                                <TableCell>{h.observacion}</TableCell>
                                                <TableCell align="center">{h.totalLineas}</TableCell>
                                                <TableCell>{h.estadoId}</TableCell>
                                                <TableCell>{h.usuarioReg}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* ── Modal búsqueda de producto ───────────────────────────────── */}
            {search.config && (
                <ModalSearch
                    open={search.isOpen}
                    onClose={search.closeModal}
                    onSelect={handleProductoSelect}
                    config={search.config}
                    initialValues={search.initialValues}
                />
            )}

            {/* ── Snackbar ─────────────────────────────────────────────────── */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: "100%" }}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AjusteInventarioView;
