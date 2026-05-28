import React, { useCallback, useEffect, useRef, useState } from "react";
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
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
import { useSharedSucursalesActivas } from "../../apis/SucursalController";
import { SgSucursal } from "../../models/seguridad/SgSucursal";
import { buscarAlmacenes, InAlmacenResumenDTO } from "../../apis/AlmacenController";
import {
    InStockArbolSearchCriteria,
    InStockAlmacenNodoDTO,
    InStockLoteNodoDTO,
    InStockProductoNodoDTO,
    buscarStockProductos,
    buscarAlmacenesPorProducto,
    buscarLotesPorProductoAlmacen,
} from "../../apis/InStockArbolController";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtCantidad = (v: number) => v?.toLocaleString("en-US") ?? "0";

const ChipSalud: React.FC<{ estado?: string | null }> = ({ estado }) => {
    if (estado !== "BAJO") return null;
    return (
        <Chip
            icon={<WarningAmberIcon style={{ fontSize: 13 }} />}
            label="Stock bajo"
            size="small"
            sx={{
                bgcolor: "#ffebee",
                color: "#c62828",
                border: "1px solid #ef9a9a",
                fontWeight: 600,
                height: 20,
                fontSize: 10,
                "& .MuiChip-icon": { color: "#c62828" },
            }}
        />
    );
};

// ── sub-componentes ───────────────────────────────────────────────────────────

/** Fila nivel 3: lote (hoja del árbol, sin hijos) */
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

// ── FilaAlmacen ───────────────────────────────────────────────────────────────

interface FilaAlmacenProps {
    almacen: InStockAlmacenNodoDTO;
    productoId: number;
    criteria: InStockArbolSearchCriteria;
    expandAll: boolean;
    estadoStock?: string | null;
}

/** Fila nivel 2: almacén (colapsable → lotes cargados lazy al primer expand) */
const FilaAlmacen: React.FC<FilaAlmacenProps> = ({ almacen, productoId, criteria, expandAll, estadoStock }) => {
    const [open, setOpen] = useState(false);
    const [lotes, setLotes] = useState<InStockLoteNodoDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const loaded = useRef(false);

    // Sincronizar con el botón "expandir todo"
    useEffect(() => {
        if (expandAll && !open) {
            handleExpand();
        } else if (!expandAll) {
            setOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandAll]);

    const handleExpand = async () => {
        const next = !open;
        setOpen(next);
        if (next && !loaded.current) {
            setLoading(true);
            try {
                const data = await buscarLotesPorProductoAlmacen(
                    productoId,
                    almacen.almacenId,
                    criteria
                );
                setLotes(data);
                loaded.current = true;
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <TableRow
                sx={{ bgcolor: "#e8f5e9", cursor: "pointer", "&:hover": { bgcolor: "#c8e6c9" } }}
                onClick={handleExpand}
            >
                <TableCell sx={{ width: 40, border: 0 }} />
                <TableCell sx={{ width: 40, py: 0.8 }}>
                    <IconButton size="small" tabIndex={-1}>
                        {open
                            ? <KeyboardArrowDownIcon fontSize="small" />
                            : <KeyboardArrowRightIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ py: 0.8 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <WarehouseIcon sx={{ fontSize: 16, color: "#388e3c" }} />
                        <Typography variant="body2" fontWeight={500}>
                            {almacen.almacenNombre}
                        </Typography>
                        {loading && <CircularProgress size={12} sx={{ ml: 0.5 }} />}
                        {loaded.current && !loading && (
                            <Chip
                                label={`${lotes.length} ${lotes.length === 1 ? "lote" : "lotes"}`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 18, fontSize: 10 }}
                            />
                        )}
                        <ChipSalud estado={estadoStock ?? almacen.estadoStock} />
                    </Box>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, py: 0.8 }}>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        color={(estadoStock ?? almacen.estadoStock) === "BAJO" ? "#c62828" : "#2e7d32"}
                    >
                        {fmtCantidad(almacen.totalCantidad)}
                    </Typography>
                </TableCell>
            </TableRow>

            <TableRow sx={{ p: 0 }}>
                <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: "fixed" }}>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 1.5 }}>
                                            <CircularProgress size={18} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lotes.map((lote, idx) => (
                                        <FilaLote
                                            key={`${lote.lote ?? "null"}_${idx}`}
                                            lote={lote.lote}
                                            cantidad={lote.cantidad}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// ── FilaProducto ──────────────────────────────────────────────────────────────

interface FilaProductoProps {
    producto: InStockProductoNodoDTO;
    criteria: InStockArbolSearchCriteria;
    expandAll: boolean;
}

/** Fila nivel 1: producto (colapsable → almacenes cargados lazy al primer expand) */
const FilaProducto: React.FC<FilaProductoProps> = ({ producto, criteria, expandAll }) => {
    const [open, setOpen] = useState(false);
    const [almacenes, setAlmacenes] = useState<InStockAlmacenNodoDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const loaded = useRef(false);

    // Sincronizar con el botón "expandir todo"
    useEffect(() => {
        if (expandAll && !open) {
            handleExpand();
        } else if (!expandAll) {
            setOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandAll]);

    const handleExpand = async () => {
        const next = !open;
        setOpen(next);
        if (next && !loaded.current) {
            setLoading(true);
            try {
                const data = await buscarAlmacenesPorProducto(producto.productoId, criteria);
                setAlmacenes(data);
                loaded.current = true;
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <TableRow
                sx={{
                    bgcolor: "#e3f2fd",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#bbdefb" },
                    "& td": { borderBottom: "1px solid #90caf9" },
                }}
                onClick={handleExpand}
            >
                <TableCell sx={{ width: 40, py: 1 }}>
                    <IconButton size="small" tabIndex={-1}>
                        {open
                            ? <KeyboardArrowDownIcon fontSize="small" />
                            : <KeyboardArrowRightIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ width: 40, border: 0 }} />
                <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <InventoryIcon sx={{ fontSize: 18, color: "#1565c0" }} />
                        <Typography variant="body2" fontWeight={700}>
                            {producto.productoNombre}
                        </Typography>
                        {loading && <CircularProgress size={14} sx={{ ml: 0.5 }} />}
                        {loaded.current && !loading && (
                            <Chip
                                label={`${almacenes.length} ${almacenes.length === 1 ? "almacén" : "almacenes"}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 18, fontSize: 10 }}
                            />
                        )}
                        <ChipSalud estado={producto.estadoStock} />
                    </Box>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, py: 1 }}>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        color={producto.estadoStock === "BAJO" ? "#c62828" : "primary"}
                    >
                        {fmtCantidad(producto.totalCantidad)}
                    </Typography>
                </TableCell>
            </TableRow>

            <TableRow sx={{ p: 0 }}>
                <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: "fixed" }}>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 1.5 }}>
                                            <CircularProgress size={22} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    almacenes.map((alm) => (
                                        <FilaAlmacen
                                            key={alm.almacenId}
                                            almacen={alm}
                                            productoId={producto.productoId}
                                            criteria={criteria}
                                            expandAll={expandAll}
                                            estadoStock={alm.estadoStock}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

/**
 * Calcula cuántos productos caben en pantalla sin scroll vertical.
 * Descuenta: ActionBar (~60px), panel filtros (~100px), cabecera tabla (~48px),
 * paginador (~52px) y padding (~32px). Cada fila producto mide ~41px (MUI size="small").
 */
function calcPageSize(): number {
    const overhead = 292;
    const rowPx = 41;
    return Math.max(5, Math.min(50, Math.floor((window.innerHeight - overhead) / rowPx)));
}

// ── componente principal ──────────────────────────────────────────────────────

const StockArbolView: React.FC = () => {
    // Catálogos — shared hook: una sola llamada al API sin importar cuántas instancias o
    // cuántas veces StrictMode ejecute los efectos.
    const { data: sucursales } = useSharedSucursalesActivas();
    const [almacenes, setAlmacenes] = useState<InAlmacenResumenDTO[]>([]);

    // Filtros
    const [sucursalId, setSucursalId] = useState<string>("");
    const [almacenId, setAlmacenId] = useState<string>("");
    const [productoNombre, setProductoNombre] = useState("");
    const [soloConStock, setSoloConStock] = useState(true);

    // Criterios de filtro activos — se pasan a los sub-componentes para niveles 2 y 3
    const [activeFilters, setActiveFilters] = useState<InStockArbolSearchCriteria>({
        soloConStock: true,
    });

    // Datos y paginación
    const [rows, setRows] = useState<InStockProductoNodoDTO[]>([]);
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    // pageSize se calcula una vez al montar según la altura de pantalla disponible
    const [pageSize] = useState<number>(calcPageSize);

    // UI
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [snackOpen, setSnackOpen] = useState(false);
    const [expandAll, setExpandAll] = useState(false);

    // ── Función central de búsqueda (nivel 1) ────────────────────────────
    const doSearch = useCallback(async (targetPage: number) => {
        setLoading(true);
        setErrorMsg("");
        setExpandAll(false);
        try {
            const filters: InStockArbolSearchCriteria = {
                sucursalId: sucursalId !== "" ? Number(sucursalId) : null,
                almacenId:  almacenId  !== "" ? Number(almacenId)  : null,
                productoNombre: productoNombre.trim() || undefined,
                soloConStock,
            };
            setActiveFilters(filters);
            const result = await buscarStockProductos({ ...filters, page: targetPage, size: pageSize });
            setRows(result.content);
            setTotalElements(result.totalElements);
            setPage(targetPage);
            if (result.content.length === 0) {
                setErrorMsg("No se encontraron productos con los filtros aplicados.");
                setSnackOpen(true);
            }
        } catch {
            setErrorMsg("Error al consultar el inventario.");
            setSnackOpen(true);
        } finally {
            setLoading(false);
        }
    }, [sucursalId, almacenId, productoNombre, soloConStock, pageSize]);

    // Botón Buscar → siempre vuelve a página 0
    const buscar = useCallback(() => doSearch(0), [doSearch]);

    const handlePageChange = (_: unknown, newPage: number) => {
        doSearch(newPage);
    };

    // ── Auto-seleccionar sucursal si solo hay una ─────────────────────────
    // useRef evita que StrictMode ejecute la selección dos veces.
    const autoSelectDone = useRef(false);
    useEffect(() => {
        if (autoSelectDone.current || sucursales.length === 0) return;
        autoSelectDone.current = true;
        if (sucursales.length === 1 && sucursales[0].id != null) {
            setSucursalId(String(sucursales[0].id));
        }
    }, [sucursales]);

    // ── Búsqueda inicial al montar (exactamente una vez) ──────────────────
    // useRef persiste a través del ciclo mount→cleanup→remount de StrictMode,
    // lo que garantiza una sola llamada al API incluso en desarrollo.
    const mountSearchDone = useRef(false);
    useEffect(() => {
        if (mountSearchDone.current) return;
        mountSearchDone.current = true;
        doSearch(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Recargar almacenes cuando cambia la sucursal ──────────────────────
    // El guard de prev-value evita la doble ejecución de StrictMode con el
    // mismo sucursalId, pero deja pasar los cambios reales del usuario.
    const prevSucursalIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (prevSucursalIdRef.current === sucursalId) return;
        prevSucursalIdRef.current = sucursalId;
        setAlmacenId("");
        buscarAlmacenes({
            estadoId: "A",
            sucursalId: sucursalId !== "" ? Number(sucursalId) : undefined,
        })
            .then(setAlmacenes)
            .catch(() => {});
    }, [sucursalId]);

    return (
        <Box sx={{ p: 2 }}>
            <ActionBar title="Inventario — Stock por Almacén y Lote" />

            {/* ── Filtros ──────────────────────────────────────────────── */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="flex-end">

                    {/* Sucursal */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Sucursal</InputLabel>
                            <Select
                                label="Sucursal"
                                value={sucursalId}
                                onChange={(e) => setSucursalId(e.target.value as string)}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {sucursales.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Almacén (depende de sucursal) */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Almacén</InputLabel>
                            <Select
                                label="Almacén"
                                value={almacenId}
                                onChange={(e) => setAlmacenId(e.target.value as string)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {almacenes.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Producto */}
                    <Grid size={{ xs: 12, sm: 3 }}>
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
                    <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex", gap: 1 }}>
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
                                    criteria={activeFilters}
                                    expandAll={expandAll}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Paginación ────────────────────────────────────────────── */}
            <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[pageSize]}
                labelRowsPerPage="Por página:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} de ${count} productos`
                }
                disabled={loading}
            />

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
