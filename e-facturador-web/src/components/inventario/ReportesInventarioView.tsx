import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import ActionBar from "../../customers/ActionBar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    LabelList,
} from "recharts";
import {
    getComparativoAnual,
    getTopProductos,
    getVentasPorSemana,
    getVentasPorSucursal,
    getHistoricoProducto,
    InVentasComparativoDTO,
    InTopProductoDTO,
    InVentasSemanaDTO,
    InVentasSucursalDTO,
    InVentasMesDTO,
    InReportesCriteria,
} from "../../apis/InReportesController";
import { getSucursalesActivas } from "../../apis/SucursalController";
import { SgSucursal } from "../../models/seguridad/SgSucursal";
import { searchProductos } from "../../apis/ProductoController";

// ── paleta de colores de la app ───────────────────────────────────────────────
const C = {
    dark:   "#272C36",
    d2:     "#3D4453",
    mid:    "#525C71",
    d4:     "#67748F",
    light:  "#848EA5",
    accent: "#A0A9BD",
};

// Colores para el gráfico de pie (sucursales)
const PIE_COLORS = [C.mid, C.d4, C.d2, C.light, C.accent, C.dark];

// ── helpers ───────────────────────────────────────────────────────────────────
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const fmtMes = (mes: number) => MESES[(mes - 1) % 12] ?? String(mes);
const fmtNum = (v: number | undefined | null) =>
    v == null ? "0" : v.toLocaleString("en-US");

const hoy = new Date();
const isoHoy = hoy.toISOString().slice(0, 10);
const isoInicioAnio = `${hoy.getFullYear()}-01-01`;

// ── sub-componentes de filtros ────────────────────────────────────────────────

interface RangoFechasProps {
    desde: string;
    hasta: string;
    onDesde: (v: string) => void;
    onHasta: (v: string) => void;
}
const RangoFechas: React.FC<RangoFechasProps> = ({ desde, hasta, onDesde, onHasta }) => (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
            label="Desde"
            type="date"
            size="small"
            value={desde}
            onChange={(e) => onDesde(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
        />
        <TextField
            label="Hasta"
            type="date"
            size="small"
            value={hasta}
            onChange={(e) => onHasta(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
        />
    </Box>
);

interface SucursalSelectProps {
    sucursales: SgSucursal[];
    value: number | "";
    onChange: (v: number | "") => void;
}
const SucursalSelect: React.FC<SucursalSelectProps> = ({ sucursales, value, onChange }) => (
    <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Sucursal</InputLabel>
        <Select
            value={value}
            label="Sucursal"
            onChange={(e) => onChange(e.target.value as number | "")}
        >
            <MenuItem value="">Todas</MenuItem>
            {sucursales.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
            ))}
        </Select>
    </FormControl>
);

// ── componente principal ──────────────────────────────────────────────────────

const ReportesInventarioView: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [snackMsg, setSnackMsg] = useState("");
    const [snackOpen, setSnackOpen] = useState(false);

    const mountDone = useRef(false);
    useEffect(() => {
        if (mountDone.current) return;
        mountDone.current = true;
        getSucursalesActivas().then(setSucursales).catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const showError = (msg: string) => { setSnackMsg(msg); setSnackOpen(true); };

    // ── estado por tab ────────────────────────────────────────────────────────

    // Tab 0: Año vs Año
    const [cmpAnio, setCmpAnio] = useState(hoy.getFullYear());
    const [cmpSuc, setCmpSuc] = useState<number | "">("");
    const [cmpData, setCmpData] = useState<InVentasComparativoDTO[]>([]);
    const [cmpLoading, setCmpLoading] = useState(false);

    const cargarComparativo = useCallback(async () => {
        setCmpLoading(true);
        try {
            const c: InReportesCriteria = { anio: cmpAnio, sucursalId: cmpSuc || null };
            setCmpData(await getComparativoAnual(c));
        } catch { showError("Error al cargar comparativo anual."); }
        finally { setCmpLoading(false); }
    }, [cmpAnio, cmpSuc]);

    // Tab 1: Top Productos
    const [topDesde, setTopDesde] = useState(isoInicioAnio);
    const [topHasta, setTopHasta] = useState(isoHoy);
    const [topSuc, setTopSuc] = useState<number | "">("");
    const [topN, setTopN] = useState(10);
    const [topData, setTopData] = useState<InTopProductoDTO[]>([]);
    const [topLoading, setTopLoading] = useState(false);

    const cargarTop = useCallback(async () => {
        setTopLoading(true);
        try {
            const c: InReportesCriteria = {
                fechaInicio: topDesde, fechaFin: topHasta,
                sucursalId: topSuc || null, top: topN,
            };
            setTopData(await getTopProductos(c));
        } catch { showError("Error al cargar top productos."); }
        finally { setTopLoading(false); }
    }, [topDesde, topHasta, topSuc, topN]);

    // Tab 2: Por Semana
    const [semDesde, setSemDesde] = useState(isoInicioAnio);
    const [semHasta, setSemHasta] = useState(isoHoy);
    const [semSuc, setSemSuc] = useState<number | "">("");
    const [semData, setSemData] = useState<InVentasSemanaDTO[]>([]);
    const [semLoading, setSemLoading] = useState(false);

    const cargarSemana = useCallback(async () => {
        setSemLoading(true);
        try {
            const c: InReportesCriteria = {
                fechaInicio: semDesde, fechaFin: semHasta,
                sucursalId: semSuc || null,
            };
            setSemData(await getVentasPorSemana(c));
        } catch { showError("Error al cargar ventas por semana."); }
        finally { setSemLoading(false); }
    }, [semDesde, semHasta, semSuc]);

    // Tab 3: Por Sucursal
    const [sucDesde, setSucDesde] = useState(isoInicioAnio);
    const [sucHasta, setSucHasta] = useState(isoHoy);
    const [sucData, setSucData] = useState<InVentasSucursalDTO[]>([]);
    const [sucLoading, setSucLoading] = useState(false);

    const cargarSucursal = useCallback(async () => {
        setSucLoading(true);
        try {
            const c: InReportesCriteria = { fechaInicio: sucDesde, fechaFin: sucHasta };
            setSucData(await getVentasPorSucursal(c));
        } catch { showError("Error al cargar ventas por sucursal."); }
        finally { setSucLoading(false); }
    }, [sucDesde, sucHasta]);

    // Tab 4: Histórico Producto
    const [hpDesde, setHpDesde] = useState(`${hoy.getFullYear() - 1}-01-01`);
    const [hpHasta, setHpHasta] = useState(isoHoy);
    const [hpSuc, setHpSuc] = useState<number | "">("");
    const [hpQuery, setHpQuery] = useState("");
    const [hpResultados, setHpResultados] = useState<{id: number; nombreProducto: string}[]>([]);
    const [hpProductoId, setHpProductoId] = useState<number | null>(null);
    const [hpProductoNombre, setHpProductoNombre] = useState("");
    const [hpData, setHpData] = useState<InVentasMesDTO[]>([]);
    const [hpLoading, setHpLoading] = useState(false);
    const [hpBuscando, setHpBuscando] = useState(false);

    const buscarProducto = useCallback(async () => {
        if (!hpQuery.trim()) return;
        setHpBuscando(true);
        try {
            const res = await searchProductos(hpQuery);
            setHpResultados(res.map((p: any) => ({ id: p.id, nombreProducto: p.nombreProducto })));
        } catch { showError("Error al buscar productos."); }
        finally { setHpBuscando(false); }
    }, [hpQuery]);

    const cargarHistorico = useCallback(async () => {
        if (!hpProductoId) { showError("Selecciona un producto primero."); return; }
        setHpLoading(true);
        try {
            const c: InReportesCriteria = {
                fechaInicio: hpDesde, fechaFin: hpHasta,
                productoId: hpProductoId, sucursalId: hpSuc || null,
            };
            setHpData(await getHistoricoProducto(c));
        } catch { showError("Error al cargar historial del producto."); }
        finally { setHpLoading(false); }
    }, [hpDesde, hpHasta, hpProductoId, hpSuc]);

    // ── header compartido de filtros ──────────────────────────────────────────
    const BtnGenerar = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
        <Button
            variant="contained"
            size="small"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <BarChartIcon />}
            onClick={onClick}
            disabled={loading}
            sx={{ bgcolor: C.mid, "&:hover": { bgcolor: C.d2 } }}
        >
            Generar
        </Button>
    );

    const FiltersBox = ({ children }: { children: React.ReactNode }) => (
        <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
                {children}
            </Box>
        </Paper>
    );

    const ChartPaper = ({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) => (
        <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
                {loading && <CircularProgress size={16} />}
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>{children}</Box>
        </Paper>
    );

    // ── renders por tab ───────────────────────────────────────────────────────

    // Tab 0: comparativo anual
    const comparativoData = cmpData.map((d) => ({
        mes: fmtMes(d.mes),
        [cmpAnio]: d.unidadesActual,
        [cmpAnio - 1]: d.unidadesAnterior,
    }));

    // Tab 1: top productos (barras horizontales)
    const topChartData = [...topData].reverse().map((d) => ({
        nombre: d.productoNombre.length > 28 ? d.productoNombre.slice(0, 26) + "…" : d.productoNombre,
        unidades: d.unidades,
    }));

    // Tab 2: semanas
    const semChartData = semData.map((d) => ({
        label: `S${d.semana}`,
        unidades: d.unidades,
    }));

    // Tab 4: histórico producto (línea)
    const hpChartData = hpData.map((d) => ({
        label: `${fmtMes(d.mes)} ${d.anio}`,
        unidades: d.unidades,
    }));

    return (
        <>
            <ActionBar title="Reportes de Inventario">
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                        if (tab === 0) cargarComparativo();
                        if (tab === 1) cargarTop();
                        if (tab === 2) cargarSemana();
                        if (tab === 3) cargarSucursal();
                        if (tab === 4) cargarHistorico();
                    }}
                    sx={{ bgcolor: C.d4, "&:hover": { bgcolor: C.mid } }}
                >
                    Actualizar
                </Button>
            </ActionBar>

            {/* Tabs de navegación */}
            <Box sx={{ mx: 2.5, mt: 2, borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    TabIndicatorProps={{ style: { backgroundColor: C.mid } }}
                    sx={{ "& .MuiTab-root.Mui-selected": { color: C.dark, fontWeight: 700 } }}
                >
                    <Tab label="Año vs Año" />
                    <Tab label="Top Productos" />
                    <Tab label="Por Semana" />
                    <Tab label="Por Sucursal" />
                    <Tab label="Historial Producto" />
                </Tabs>
            </Box>

            {/* ── Tab 0: Comparativo anual ────────────────────────────────── */}
            {tab === 0 && (
                <>
                    <FiltersBox>
                        <TextField
                            label="Año"
                            type="number"
                            size="small"
                            value={cmpAnio}
                            onChange={(e) => setCmpAnio(Number(e.target.value))}
                            InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                            sx={{ width: 110 }}
                        />
                        <SucursalSelect sucursales={sucursales} value={cmpSuc} onChange={setCmpSuc} />
                        <BtnGenerar onClick={cargarComparativo} loading={cmpLoading} />
                    </FiltersBox>

                    <ChartPaper title={`Ventas mensuales: ${cmpAnio} vs ${cmpAnio - 1}`} loading={cmpLoading}>
                        {comparativoData.length === 0 ? (
                            <Typography color="text.secondary" align="center" py={4}>
                                Haz clic en "Generar" para ver los datos.
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={comparativoData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip formatter={(v: any) => fmtNum(v)} />
                                    <Legend />
                                    <Bar dataKey={String(cmpAnio)} name={String(cmpAnio)} fill={C.mid} radius={[3,3,0,0]} />
                                    <Bar dataKey={String(cmpAnio - 1)} name={String(cmpAnio - 1)} fill={C.accent} radius={[3,3,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartPaper>

                    {/* Tabla resumen comparativo */}
                    {cmpData.length > 0 && (
                        <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, overflow: "hidden" }}>
                            <TableContainer sx={{ maxHeight: 320 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {["Mes","Unidades "+cmpAnio,"Unidades "+(cmpAnio-1),"Variación"].map((h) => (
                                                <TableCell key={h} sx={{ fontWeight: 700, bgcolor: C.dark, color: "#fff" }}>
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cmpData.map((d) => {
                                            const diff = d.unidadesActual - d.unidadesAnterior;
                                            const pct = d.unidadesAnterior > 0
                                                ? ((diff / d.unidadesAnterior) * 100).toFixed(1)
                                                : "—";
                                            return (
                                                <TableRow key={d.mes} hover>
                                                    <TableCell>{fmtMes(d.mes)}</TableCell>
                                                    <TableCell>{fmtNum(d.unidadesActual)}</TableCell>
                                                    <TableCell>{fmtNum(d.unidadesAnterior)}</TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            color={diff >= 0 ? "success.main" : "error.main"}
                                                            fontWeight={600}
                                                        >
                                                            {diff >= 0 ? "+" : ""}{fmtNum(diff)} {pct !== "—" ? `(${pct}%)` : ""}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </>
            )}

            {/* ── Tab 1: Top Productos ────────────────────────────────────── */}
            {tab === 1 && (
                <>
                    <FiltersBox>
                        <RangoFechas desde={topDesde} hasta={topHasta} onDesde={setTopDesde} onHasta={setTopHasta} />
                        <SucursalSelect sucursales={sucursales} value={topSuc} onChange={setTopSuc} />
                        <TextField
                            label="Top N"
                            type="number"
                            size="small"
                            value={topN}
                            onChange={(e) => setTopN(Math.max(1, Number(e.target.value)))}
                            InputProps={{ inputProps: { min: 1, max: 50 } }}
                            sx={{ width: 90 }}
                        />
                        <BtnGenerar onClick={cargarTop} loading={topLoading} />
                    </FiltersBox>

                    <ChartPaper title={`Top ${topN} productos más vendidos`} loading={topLoading}>
                        {topChartData.length === 0 ? (
                            <Typography color="text.secondary" align="center" py={4}>
                                Haz clic en "Generar" para ver los datos.
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={Math.max(300, topChartData.length * 36)}>
                                <BarChart
                                    layout="vertical"
                                    data={topChartData}
                                    margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis dataKey="nombre" type="category" width={200} tick={{ fontSize: 11 }} />
                                    <ChartTooltip formatter={(v: any) => fmtNum(v)} />
                                    <Bar dataKey="unidades" fill={C.mid} radius={[0,3,3,0]}>
                                        <LabelList dataKey="unidades" position="right" formatter={(v: any) => fmtNum(v)} style={{ fontSize: 11, fill: C.d2 }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartPaper>

                    {topData.length > 0 && (
                        <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, overflow: "hidden" }}>
                            <TableContainer sx={{ maxHeight: 320 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {["#","Producto","Unidades","Costo Total"].map((h) => (
                                                <TableCell key={h} sx={{ fontWeight: 700, bgcolor: C.dark, color: "#fff" }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topData.map((d, i) => (
                                            <TableRow key={d.productoId} hover>
                                                <TableCell sx={{ color: "text.secondary", width: "5%" }}>{i + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: i === 0 ? 700 : 400 }}>{d.productoNombre}</TableCell>
                                                <TableCell>{fmtNum(d.unidades)}</TableCell>
                                                <TableCell>{d.costoTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </>
            )}

            {/* ── Tab 2: Por Semana ───────────────────────────────────────── */}
            {tab === 2 && (
                <>
                    <FiltersBox>
                        <RangoFechas desde={semDesde} hasta={semHasta} onDesde={setSemDesde} onHasta={setSemHasta} />
                        <SucursalSelect sucursales={sucursales} value={semSuc} onChange={setSemSuc} />
                        <BtnGenerar onClick={cargarSemana} loading={semLoading} />
                    </FiltersBox>

                    <ChartPaper title="Unidades vendidas por semana del año" loading={semLoading}>
                        {semChartData.length === 0 ? (
                            <Typography color="text.secondary" align="center" py={4}>
                                Haz clic en "Generar" para ver los datos.
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={semChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip formatter={(v: any) => fmtNum(v)} />
                                    <Bar dataKey="unidades" fill={C.mid} radius={[3,3,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartPaper>

                    {semData.length > 0 && (() => {
                        const sorted = [...semData].sort((a, b) => b.unidades - a.unidades).slice(0, 5);
                        return (
                            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                    Semanas con más ventas
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                    {sorted.map((d, i) => (
                                        <Paper key={d.semana} variant="outlined"
                                            sx={{ p: 1.5, minWidth: 110, textAlign: "center",
                                                bgcolor: i === 0 ? "#f0f2f5" : "inherit",
                                                borderColor: i === 0 ? C.mid : undefined }}>
                                            <Typography variant="h6" fontWeight={700} color={C.dark}>
                                                Sem. {d.semana}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {fmtNum(d.unidades)} uds
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            </Paper>
                        );
                    })()}
                </>
            )}

            {/* ── Tab 3: Por Sucursal ─────────────────────────────────────── */}
            {tab === 3 && (
                <>
                    <FiltersBox>
                        <RangoFechas desde={sucDesde} hasta={sucHasta} onDesde={setSucDesde} onHasta={setSucHasta} />
                        <BtnGenerar onClick={cargarSucursal} loading={sucLoading} />
                    </FiltersBox>

                    <Box sx={{ display: "flex", gap: 2, mx: 2.5, mt: 2, flexWrap: "wrap" }}>
                        {/* Pie */}
                        <Paper variant="outlined" sx={{ flex: "1 1 340px", p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                Distribución por sucursal
                            </Typography>
                            {sucData.length === 0 ? (
                                <Typography color="text.secondary" align="center" py={4}>
                                    Haz clic en "Generar" para ver los datos.
                                </Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={sucData}
                                            dataKey="unidades"
                                            nameKey="sucursalNombre"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) =>
                                                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                            }
                                            labelLine
                                        >
                                            {sucData.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip formatter={(v: any) => fmtNum(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>

                        {/* Tabla */}
                        <Paper variant="outlined" sx={{ flex: "1 1 340px", overflow: "hidden" }}>
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight={700}>Detalle por sucursal</Typography>
                            </Box>
                            <Divider />
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {["Sucursal","Unidades","Costo Total"].map((h) => (
                                                <TableCell key={h} sx={{ fontWeight: 700, bgcolor: C.dark, color: "#fff" }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sucData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                    Sin datos
                                                </TableCell>
                                            </TableRow>
                                        ) : sucData.map((d, i) => (
                                            <TableRow key={d.sucursalId} hover>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Box sx={{ width: 10, height: 10, borderRadius: "50%",
                                                            bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                        {d.sucursalNombre}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{fmtNum(d.unidades)}</TableCell>
                                                <TableCell>{d.costoTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                </>
            )}

            {/* ── Tab 4: Historial Producto ───────────────────────────────── */}
            {tab === 4 && (
                <>
                    <FiltersBox>
                        <RangoFechas desde={hpDesde} hasta={hpHasta} onDesde={setHpDesde} onHasta={setHpHasta} />
                        <SucursalSelect sucursales={sucursales} value={hpSuc} onChange={setHpSuc} />
                    </FiltersBox>

                    {/* Buscador de producto */}
                    <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            Seleccionar producto
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
                            <TextField
                                label="Buscar producto"
                                size="small"
                                value={hpQuery}
                                onChange={(e) => setHpQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscarProducto()}
                                sx={{ width: 280 }}
                                placeholder="Nombre o código…"
                            />
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={buscarProducto}
                                disabled={hpBuscando}
                                sx={{ borderColor: C.mid, color: C.mid }}
                            >
                                {hpBuscando ? <CircularProgress size={14} /> : "Buscar"}
                            </Button>
                            {hpProductoId && (
                                <Tooltip title="Producto seleccionado">
                                    <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#f0f2f5", borderRadius: 1,
                                        border: `1px solid ${C.light}`, fontSize: 13 }}>
                                        {hpProductoNombre}
                                    </Box>
                                </Tooltip>
                            )}
                        </Box>

                        {hpResultados.length > 0 && (
                            <Box sx={{ mt: 1.5, maxHeight: 180, overflowY: "auto" }}>
                                {hpResultados.map((p) => (
                                    <Box
                                        key={p.id}
                                        onClick={() => {
                                            setHpProductoId(p.id);
                                            setHpProductoNombre(p.nombreProducto);
                                            setHpResultados([]);
                                            setHpQuery("");
                                        }}
                                        sx={{
                                            px: 1.5, py: 0.8, cursor: "pointer",
                                            borderRadius: 1, fontSize: 13,
                                            "&:hover": { bgcolor: "#f0f2f5" },
                                        }}
                                    >
                                        {p.nombreProducto}
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ mt: 2 }}>
                            <BtnGenerar onClick={cargarHistorico} loading={hpLoading} />
                        </Box>
                    </Paper>

                    <ChartPaper
                        title={hpProductoNombre ? `Historial: ${hpProductoNombre}` : "Historial de ventas mensual"}
                        loading={hpLoading}
                    >
                        {hpChartData.length === 0 ? (
                            <Typography color="text.secondary" align="center" py={4}>
                                Selecciona un producto y haz clic en "Generar".
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={hpChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip formatter={(v: any) => fmtNum(v)} />
                                    <Line
                                        type="monotone"
                                        dataKey="unidades"
                                        stroke={C.mid}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: C.mid }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartPaper>

                    {hpData.length > 0 && (() => {
                        const total = hpData.reduce((s, d) => s + d.unidades, 0);
                        const promedio = Math.round(total / hpData.length);
                        const recomendado = Math.ceil(promedio * 1.2);
                        const max = hpData.reduce((m, d) => d.unidades > m ? d.unidades : m, 0);
                        const mesMax = hpData.find((d) => d.unidades === max);
                        return (
                            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                                    Análisis de reposición
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                    {[
                                        { label: "Promedio mensual", value: fmtNum(promedio) + " uds" },
                                        { label: "Mes pico", value: mesMax ? `${fmtMes(mesMax.mes)} ${mesMax.anio}` : "—" },
                                        { label: "Pico de ventas", value: fmtNum(max) + " uds" },
                                        { label: "Stock recomendado (+20%)", value: fmtNum(recomendado) + " uds", highlight: true },
                                    ].map((stat) => (
                                        <Paper key={stat.label} variant="outlined"
                                            sx={{ p: 1.5, minWidth: 160,
                                                bgcolor: stat.highlight ? "#f0f2f5" : "inherit",
                                                borderColor: stat.highlight ? C.mid : undefined }}>
                                            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                            <Typography variant="h6" fontWeight={700} color={C.dark}>
                                                {stat.value}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            </Paper>
                        );
                    })()}
                </>
            )}

            <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity="error" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
            </Snackbar>
        </>
    );
};

export default ReportesInventarioView;
