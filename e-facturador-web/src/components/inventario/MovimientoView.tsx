import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
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
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import ActionBar from "../../customers/ActionBar";
import { useAuth } from "../../contexts/AuthContext";
import { getSucursalesActivas } from "../../apis/SucursalController";
import { SgSucursal } from "../../models/seguridad/SgSucursal";
import {
    buscarMovimientos,
    InMovimientoResumenDTO,
    InMovimientoSearchCriteria,
} from "../../apis/InMovimientoController";

// ── helpers ──────────────────────────────────────────────────────────────────

const hoy = () => new Date().toISOString().slice(0, 10);
const hace30Dias = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
};

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

const TODOS_SUCURSAL = "__TODAS__";

// ── component ─────────────────────────────────────────────────────────────────

const MovimientoView: React.FC = () => {
    const { user } = useAuth();

    // Sucursales disponibles
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(
        user?.sucursalId ? String(user.sucursalId) : TODOS_SUCURSAL
    );

    // Filtros
    const [fechaInicio, setFechaInicio] = useState(hace30Dias());
    const [fechaFin, setFechaFin] = useState(hoy());
    const [almacenId, setAlmacenId] = useState("");
    const [productoId, setProductoId] = useState("");
    const [tipoMovimientoId, setTipoMovimientoId] = useState("");
    const [numeroReferencia, setNumeroReferencia] = useState("");
    const [lote, setLote] = useState("");

    // Resultados
    const [rows, setRows] = useState<InMovimientoResumenDTO[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [loading, setLoading] = useState(false);

    // Snackbar
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");

    // Cargar sucursales al montar
    useEffect(() => {
        getSucursalesActivas().then(setSucursales).catch(() => {});
    }, []);

    const buildCriteria = (p = page, rpp = rowsPerPage): InMovimientoSearchCriteria => ({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        sucursalId:
            sucursalSeleccionada === TODOS_SUCURSAL
                ? null
                : Number(sucursalSeleccionada),
        almacenId: almacenId ? Number(almacenId) : undefined,
        productoId: productoId ? Number(productoId) : undefined,
        tipoMovimientoId: tipoMovimientoId ? Number(tipoMovimientoId) : undefined,
        numeroReferencia: numeroReferencia ? Number(numeroReferencia) : undefined,
        lote: lote || undefined,
        page: p,
        size: rpp,
    });

    const buscar = async (p = 0) => {
        setLoading(true);
        try {
            const result = await buscarMovimientos(buildCriteria(p, rowsPerPage));
            setRows(result.content);
            setTotalElements(result.totalElements);
            setPage(p);
        } catch {
            setSnackMsg("Error al cargar los movimientos");
            setSnackOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (_: unknown, newPage: number) => buscar(newPage);

    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rpp = parseInt(e.target.value, 10);
        setRowsPerPage(rpp);
        setPage(0);
        setLoading(true);
        buscarMovimientos(buildCriteria(0, rpp))
            .then((r) => { setRows(r.content); setTotalElements(r.totalElements); })
            .catch(() => { setSnackMsg("Error al cargar"); setSnackOpen(true); })
            .finally(() => setLoading(false));
    };

    return (
        <>
            <ActionBar title="Historial de Movimientos" />

            {/* ── Filtros ─────────────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                    Filtros de búsqueda
                </Typography>

                <Grid container spacing={2} alignItems="flex-end">
                    {/* Sucursal */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sucursal</InputLabel>
                            <Select
                                label="Sucursal"
                                value={sucursalSeleccionada}
                                onChange={(e) => setSucursalSeleccionada(e.target.value)}>
                                <MenuItem value={TODOS_SUCURSAL}>
                                    <em>Todas las sucursales</em>
                                </MenuItem>
                                {sucursales.map((s) => (
                                    <MenuItem key={s.id} value={String(s.id)}>
                                        {s.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Fecha inicio */}
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            fullWidth size="small" type="date" label="Desde"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Fecha fin */}
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            fullWidth size="small" type="date" label="Hasta"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Almacén */}
                    <Grid size={{ xs: 6, md: 1 }}>
                        <TextField
                            fullWidth size="small" label="Almacén ID" type="number"
                            value={almacenId}
                            onChange={(e) => setAlmacenId(e.target.value)}
                        />
                    </Grid>

                    {/* Producto */}
                    <Grid size={{ xs: 6, md: 1 }}>
                        <TextField
                            fullWidth size="small" label="Producto ID" type="number"
                            value={productoId}
                            onChange={(e) => setProductoId(e.target.value)}
                        />
                    </Grid>

                    {/* Tipo movimiento */}
                    <Grid size={{ xs: 6, md: 1 }}>
                        <TextField
                            fullWidth size="small" label="Tipo mov." type="number"
                            value={tipoMovimientoId}
                            onChange={(e) => setTipoMovimientoId(e.target.value)}
                        />
                    </Grid>

                    {/* Referencia */}
                    <Grid size={{ xs: 6, md: 1 }}>
                        <TextField
                            fullWidth size="small" label="Referencia" type="number"
                            value={numeroReferencia}
                            onChange={(e) => setNumeroReferencia(e.target.value)}
                        />
                    </Grid>

                    {/* Lote */}
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            fullWidth size="small" label="Lote / Serie"
                            value={lote}
                            onChange={(e) => setLote(e.target.value)}
                        />
                    </Grid>

                    {/* Botón */}
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                            fullWidth variant="contained" startIcon={<SearchIcon />}
                            onClick={() => buscar(0)}
                            disabled={loading}>
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* ── Tabla ───────────────────────────────────────────────── */}
            <Box sx={{ px: 2.5, pb: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper variant="outlined">
                        <TableContainer>
                            <Table size="small">
                                <TableHead
                                    sx={{
                                        backgroundColor: "#00695c",
                                        "& .MuiTableCell-root": {
                                            color: "#fff",
                                            fontWeight: 700,
                                        },
                                    }}>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Sucursal</TableCell>
                                        <TableCell>Tipo Mov.</TableCell>
                                        <TableCell>Referencia</TableCell>
                                        <TableCell>Almacén</TableCell>
                                        <TableCell>Producto</TableCell>
                                        <TableCell>Lote/Serie</TableCell>
                                        <TableCell align="right">Cantidad</TableCell>
                                        <TableCell align="right">Stock Post</TableCell>
                                        <TableCell align="right">P. Unitario</TableCell>
                                        <TableCell align="right">Costo Total</TableCell>
                                        <TableCell>Usuario</TableCell>
                                        <TableCell>Observación</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={14} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                Sin resultados. Use los filtros y presione Buscar.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((r) => (
                                            <TableRow key={r.id} hover>
                                                <TableCell>{r.id}</TableCell>
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                    {fmtFecha(r.fechaReg)}
                                                </TableCell>
                                                <TableCell>
                                                    {sucursales.find((s) => String(s.id) === sucursalSeleccionada)?.nombre ??
                                                        (sucursalSeleccionada === TODOS_SUCURSAL ? "—" : sucursalSeleccionada)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={r.tipoMovimientoId} size="small" />
                                                </TableCell>
                                                <TableCell>{r.numeroReferencia ?? "—"}</TableCell>
                                                <TableCell>{r.almacenId}</TableCell>
                                                <TableCell>
                                                    {r.productoNombre
                                                        ? `${r.productoNombre} (${r.productoId})`
                                                        : r.productoId}
                                                </TableCell>
                                                <TableCell>{r.lote ?? "—"}</TableCell>
                                                <TableCell align="right"
                                                    sx={{ color: r.cantidad < 0 ? "error.main" : "success.main", fontWeight: 600 }}>
                                                    {r.cantidad}
                                                </TableCell>
                                                <TableCell align="right">{r.cantidadInventario ?? "—"}</TableCell>
                                                <TableCell align="right">{fmtNum(r.precioUnitario)}</TableCell>
                                                <TableCell align="right">{fmtNum(r.costoTotal)}</TableCell>
                                                <TableCell>{r.usuarioReg}</TableCell>
                                                <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {r.observacion ?? "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={totalElements}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[25, 50, 100, 200]}
                            labelRowsPerPage="Filas por página"
                        />
                    </Paper>
                )}
            </Box>

            <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}>
                <Alert severity="error" onClose={() => setSnackOpen(false)}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MovimientoView;
