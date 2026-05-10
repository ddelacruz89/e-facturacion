import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
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
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LabelIcon from "@mui/icons-material/Label";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import ActionBar from "../../customers/ActionBar";
import { getSucursalesActivas } from "../../apis/SucursalController";
import { SgSucursal } from "../../models/seguridad/SgSucursal";
import { buscarAlmacenes, InAlmacenResumenDTO } from "../../apis/AlmacenController";
import {
    buscarStockArbol,
    InStockArbolSearchCriteria,
    InStockAlmacenNodoDTO,
    InStockProductoNodoDTO,
} from "../../apis/InStockArbolController";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtCantidad = (v: number) => v?.toLocaleString("en-US") ?? "0";

// ── sub-componentes ───────────────────────────────────────────────────────────

/** Fila nivel 3: lote */
const FilaLote: React.FC<{ lote: string | null; cantidad: number }> = ({ lote, cantidad }) => (
    <TableRow sx={{ bgcolor: "#f9fbe7" }}>
        <TableCell sx={{ width: 40, border: 0 }} />
        <TableCell sx={{ width: 40, border: 0 }} />
        <TableCell sx={{ pl: 1, py: 0.6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <LabelIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                    {lote ?? <em style={{ color: "#aaa" }}>Sin lote</em>}
                </Typography>
            </Box>
        </TableCell>
        <TableCell align="right" sx={{ pr: 3, py: 0.6 }}>
            <Typography variant="body2" color="text.secondary">
                {fmtCantidad(cantidad)}
            </Typography>
        </TableCell>
    </TableRow>
);

/** Fila nivel 2: almacén (colapsable → lotes) */
const FilaAlmacen: React.FC<{ almacen: InStockAlmacenNodoDTO; expandAll: boolean }> = ({
    almacen,
    expandAll,
}) => {
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(expandAll), [expandAll]);

    return (
        <>
            <TableRow
                sx={{ bgcolor: "#e8f5e9", cursor: "pointer", "&:hover": { bgcolor: "#c8e6c9" } }}
                onClick={() => setOpen((v) => !v)}
            >
                <TableCell sx={{ width: 40, border: 0 }} />
                <TableCell sx={{ width: 40, py: 0.8 }}>
                    <IconButton size="small" tabIndex={-1}>
                        {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ py: 0.8 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WarehouseIcon sx={{ fontSize: 16, color: "#388e3c" }} />
                        <Typography variant="body2" fontWeight={500}>
                            {almacen.almacenNombre}
                        </Typography>
                        <Chip
                            label={`${almacen.lotes.length} ${almacen.lotes.length === 1 ? "lote" : "lotes"}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: 10 }}
                        />
                    </Box>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, py: 0.8 }}>
                    <Typography variant="body2" fontWeight={600} color="#2e7d32">
                        {fmtCantidad(almacen.totalCantidad)}
                    </Typography>
                </TableCell>
            </TableRow>

            <TableRow sx={{ p: 0 }}>
                <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: "fixed" }}>
                            <TableBody>
                                {almacen.lotes.map((lote, idx) => (
                                    <FilaLote
                                        key={`${lote.lote ?? "null"}_${idx}`}
                                        lote={lote.lote}
                                        cantidad={lote.cantidad}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

/** Fila nivel 1: producto (colapsable → almacenes) */
const FilaProducto: React.FC<{ producto: InStockProductoNodoDTO; expandAll: boolean }> = ({
    producto,
    expandAll,
}) => {
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(expandAll), [expandAll]);

    return (
        <>
            <TableRow
                sx={{
                    bgcolor: "#e3f2fd",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#bbdefb" },
                    "& td": { borderBottom: "1px solid #90caf9" },
                }}
                onClick={() => setOpen((v) => !v)}
            >
                <TableCell sx={{ width: 40, py: 1 }}>
                    <IconButton size="small" tabIndex={-1}>
                        {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ width: 40, border: 0 }} />
                <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <InventoryIcon sx={{ fontSize: 18, color: "#1565c0" }} />
                        <Typography variant="body2" fontWeight={700}>
                            {producto.productoNombre}
                        </Typography>
                        <Chip
                            label={`${producto.almacenes.length} ${producto.almacenes.length === 1 ? "almacén" : "almacenes"}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 18, fontSize: 10 }}
                        />
                    </Box>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, py: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="primary">
                        {fmtCantidad(producto.totalCantidad)}
                    </Typography>
                </TableCell>
            </TableRow>

            <TableRow sx={{ p: 0 }}>
                <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: "fixed" }}>
                            <TableBody>
                                {producto.almacenes.map((alm) => (
                                    <FilaAlmacen key={alm.almacenId} almacen={alm} expandAll={expandAll} />
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// ── componente principal ──────────────────────────────────────────────────────

const StockArbolView: React.FC = () => {
    // Catálogos
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [almacenes, setAlmacenes] = useState<InAlmacenResumenDTO[]>([]);

    // Filtros
    const [sucursalId, setSucursalId] = useState<number | "">("");
    const [almacenId, setAlmacenId] = useState<number | "">("");
    const [productoNombre, setProductoNombre] = useState("");
    const [soloConStock, setSoloConStock] = useState(true);

    // Datos
    const [rows, setRows] = useState<InStockProductoNodoDTO[]>([]);

    // UI
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [snackOpen, setSnackOpen] = useState(false);
    const [expandAll, setExpandAll] = useState(false);

    // ── Carga inicial de sucursales ───────────────────────────────────────
    useEffect(() => {
        getSucursalesActivas().then((data) => {
            setSucursales(data);
            // Auto-seleccionar si solo hay una sucursal
            if (data.length === 1 && data[0].id != null) {
                setSucursalId(data[0].id);
            }
        }).catch(() => {});
    }, []);

    // ── Recargar almacenes cuando cambia la sucursal ──────────────────────
    useEffect(() => {
        setAlmacenId(""); // limpiar selección previa de almacén
        buscarAlmacenes({
            estadoId: "A",
            sucursalId: sucursalId !== "" ? sucursalId : undefined,
        })
            .then(setAlmacenes)
            .catch(() => {});
    }, [sucursalId]);

    // ── Buscar ────────────────────────────────────────────────────────────
    const buscar = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const criteria: InStockArbolSearchCriteria = {
                sucursalId: sucursalId !== "" ? sucursalId : null,
                almacenId: almacenId !== "" ? almacenId : null,
                productoNombre: productoNombre.trim() || undefined,
                soloConStock,
            };
            const data = await buscarStockArbol(criteria);
            setRows(data);
            if (data.length === 0) {
                setErrorMsg("No se encontraron productos con los filtros aplicados.");
                setSnackOpen(true);
            }
        } catch {
            setErrorMsg("Error al consultar el inventario.");
            setSnackOpen(true);
        } finally {
            setLoading(false);
        }
    }, [sucursalId, almacenId, productoNombre, soloConStock]);

    // Búsqueda inicial (espera a que sucursales carguen para no lanzar doble búsqueda)
    const [initialSearchDone, setInitialSearchDone] = useState(false);
    useEffect(() => {
        if (!initialSearchDone && sucursales.length >= 0) {
            setInitialSearchDone(true);
            buscar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sucursales]);

    const totalProductos = rows.length;
    const totalUnidades = rows.reduce((s, p) => s + (p.totalCantidad ?? 0), 0);

    return (
        <Box sx={{ p: 2 }}>
            <ActionBar title="Inventario — Stock por Almacén y Lote" />

            {/* ── Filtros ──────────────────────────────────────────────── */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="flex-end">

                    {/* Sucursal */}
                    <Grid item xs={12} sm={3}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Sucursal</InputLabel>
                            <Select
                                label="Sucursal"
                                value={sucursalId}
                                onChange={(e) =>
                                    setSucursalId(e.target.value === "" ? "" : Number(e.target.value))
                                }
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {sucursales.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Almacén (depende de sucursal seleccionada) */}
                    <Grid item xs={12} sm={3}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Almacén</InputLabel>
                            <Select
                                label="Almacén"
                                value={almacenId}
                                onChange={(e) =>
                                    setAlmacenId(e.target.value === "" ? "" : Number(e.target.value))
                                }
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {almacenes.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>
                                        {a.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Producto */}
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Producto"
                            size="small"
                            fullWidth
                            value={productoNombre}
                            onChange={(e) => setProductoNombre(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && buscar()}
                            placeholder="Buscar por nombre…"
                        />
                    </Grid>

                    {/* Stock + acciones */}
                    <Grid item xs={12} sm={3} sx={{ display: "flex", gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Stock</InputLabel>
                            <Select
                                label="Stock"
                                value={soloConStock ? "1" : "0"}
                                onChange={(e) => setSoloConStock(e.target.value === "1")}
                            >
                                <MenuItem value="1">Con stock</MenuItem>
                                <MenuItem value="0">Todos</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={buscar}
                            disabled={loading}
                            sx={{ flexShrink: 0 }}
                        >
                            Buscar
                        </Button>

                        <Tooltip title={expandAll ? "Colapsar todo" : "Expandir todo"}>
                            <span>
                                <Button
                                    variant="outlined"
                                    onClick={() => setExpandAll((v) => !v)}
                                    disabled={rows.length === 0}
                                    sx={{ minWidth: 40, px: 1, flexShrink: 0 }}
                                >
                                    {expandAll ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                                </Button>
                            </span>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper>

            {/* ── Resumen ───────────────────────────────────────────────── */}
            {rows.length > 0 && (
                <Box sx={{ display: "flex", gap: 2, mb: 1, flexWrap: "wrap" }}>
                    <Chip
                        icon={<InventoryIcon />}
                        label={`${totalProductos} producto${totalProductos !== 1 ? "s" : ""}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`${fmtCantidad(totalUnidades)} unidades totales`}
                        color="success"
                        variant="outlined"
                    />
                </Box>
            )}

            {/* ── Tabla árbol ───────────────────────────────────────────── */}
            <TableContainer component={Paper} elevation={2}>
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#1565c0" }}>
                            <TableCell sx={{ width: 40, border: 0 }} />
                            <TableCell sx={{ width: 40, border: 0 }} />
                            <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                                Producto / Almacén / Lote
                            </TableCell>
                            <TableCell
                                align="right"
                                sx={{ color: "#fff", fontWeight: 700, fontSize: 13, pr: 3, width: 140 }}
                            >
                                Cantidad
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                    Sin resultados. Ajusta los filtros y busca nuevamente.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((producto) => (
                                <FilaProducto
                                    key={producto.productoId}
                                    producto={producto}
                                    expandAll={expandAll}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Snackbar ──────────────────────────────────────────────── */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="info" onClose={() => setSnackOpen(false)}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StockArbolView;
