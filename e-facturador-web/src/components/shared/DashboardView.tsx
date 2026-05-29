import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Tooltip,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    getDashboardAjustes,
    getDashboardKpis,
    getDashboardSucursales,
    getDashboardPedidosHoy,
    getDashboardPedidosManana,
    DashboardAjusteBarDTO,
    DashboardKpiDTO,
    DashboardSucursalDTO,
    OrdenCompraEntregaHoyDTO,
} from "../../apis/DashboardController";
import { getMisPendientes } from "../../apis/AprobacionController";
import {
    SgAprobacionResumenDTO,
    TIPOS_DOCUMENTO,
} from "../../models/seguridad/SgAprobacion";

// ── paleta ────────────────────────────────────────────────────────────────────
const C = {
    dark:  "#272C36",
    d2:    "#3D4453",
    mid:   "#525C71",
    d4:    "#67748F",
    light: "#848EA5",
    bg:    "#F4F5F7",
};

// Colores e iconos por módulo
const MODULO_CONFIG: Record<string, { color: string; areaColor: string; icon: React.ReactNode }> = {
    ORDEN_ENTRADA: {
        color:     C.mid,
        areaColor: "#525C71",
        icon:      <MoveToInboxIcon sx={{ fontSize: 28, color: "#fff" }} />,
    },
    ORDEN_COMPRA: {
        color:     C.d2,
        areaColor: "#3D4453",
        icon:      <ShoppingCartIcon sx={{ fontSize: 28, color: "#fff" }} />,
    },
    REQUISICION: {
        color:     "#B45309",
        areaColor: "#B45309",
        icon:      <AssignmentIcon sx={{ fontSize: 28, color: "#fff" }} />,
    },
    TRANSFERENCIA: {
        color:     C.d4,
        areaColor: "#67748F",
        icon:      <CompareArrowsIcon sx={{ fontSize: 28, color: "#fff" }} />,
    },
};

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    kpi: DashboardKpiDTO;
}

const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
    const cfg   = MODULO_CONFIG[kpi.modulo] ?? { color: C.mid, areaColor: C.mid, icon: null };
    const spark = kpi.tendencia ?? [];

    const first    = spark.length > 0 ? spark[0].total : 0;
    const last     = spark.length > 0 ? spark[spark.length - 1].total : 0;
    const diff     = last - first;
    const subiendo = diff >= 0;

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderColor: "#E2E5EA",
            }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2.5,
                    pt: 2,
                    pb: 1.5,
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}
                        sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}>
                        {kpi.titulo}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                        <Typography variant="h3" fontWeight={700} color={C.dark}
                            sx={{ lineHeight: 1 }}>
                            {kpi.total.toLocaleString()}
                        </Typography>
                        <Tooltip title="vs. hace 7 días">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                                {subiendo
                                    ? <TrendingUpIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                                    : <TrendingDownIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                                }
                                <Typography variant="caption"
                                    sx={{ color: subiendo ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                                    {diff >= 0 ? "+" : ""}{diff}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {kpi.labelTotal}
                    </Typography>
                </Box>

                {/* Ícono coloreado */}
                <Box
                    sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        bgcolor: cfg.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {cfg.icon}
                </Box>
            </Box>

            {/* ── Sparkline ─────────────────────────────────────────────── */}
            <Box sx={{ flex: 1, minHeight: 70, mx: -0.5 }}>
                <ResponsiveContainer width="100%" height={72}>
                    <AreaChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`grad-${kpi.modulo}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={cfg.areaColor} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={cfg.areaColor} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <ChartTooltip
                            contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6 }}
                            formatter={(v: any) => [v, "total"]}
                            labelFormatter={(l) => `Día: ${l}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke={cfg.areaColor}
                            strokeWidth={2}
                            fill={`url(#grad-${kpi.modulo})`}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            {/* ── Métricas secundarias ───────────────────────────────────── */}
            {(kpi.pendientes != null || kpi.completadas != null) && (
                <>
                    <Divider />
                    <Box sx={{ display: "flex", px: 2.5, py: 1.2, gap: 2 }}>
                        {kpi.pendientes != null && (
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={700} color={C.dark}>
                                    {kpi.pendientes.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {kpi.labelPendientes}
                                </Typography>
                            </Box>
                        )}
                        {kpi.pendientes != null && kpi.completadas != null && (
                            <Divider orientation="vertical" flexItem />
                        )}
                        {kpi.completadas != null && (
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={700} color={C.dark}>
                                    {kpi.completadas.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {kpi.labelCompletadas}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Paper>
    );
};

// ── Ajustes de inventario — bar chart horizontal ──────────────────────────────

const AJUSTE_COLORS = ["#525C71", "#3D4453", "#67748F", "#848EA5"];

interface AjustesBarChartProps {
    data: DashboardAjusteBarDTO[];
}

const AjustesBarChart: React.FC<AjustesBarChartProps> = ({ data }) => {
    const totalSemana = data.reduce((s, d) => s + d.total, 0);

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2, p: 2.5, borderColor: "#E2E5EA", height: "100%" }}
        >
            <Box sx={{ mb: 1.5 }}>
                <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}
                >
                    Ajustes de inventario
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                    <Typography variant="h3" fontWeight={700} color={C.dark} sx={{ lineHeight: 1 }}>
                        {totalSemana.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        últimos 7 días
                    </Typography>
                </Box>
            </Box>

            <ResponsiveContainer width="100%" height={140}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 4, right: 32, left: 0, bottom: 4 }}
                    barCategoryGap="28%"
                >
                    <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#848EA5" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="tipoNombre"
                        width={130}
                        tick={{ fontSize: 11, fill: C.dark }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <ChartTooltip
                        cursor={{ fill: "#F4F5F7" }}
                        contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6 }}
                        formatter={(v: any) => [v, "ajustes"]}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                        {data.map((_entry, i) => (
                            <Cell key={i} fill={AJUSTE_COLORS[i % AJUSTE_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

// ── Helpers de aprobaciones ───────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = Object.fromEntries(
    TIPOS_DOCUMENTO.map((t) => [t.value, t.label])
);

const MODO_LABEL: Record<string, string> = {
    SECUENCIAL:   "Secuencial",
    SIN_ORDEN:    "Sin orden",
    AL_MENOS_UNO: "Al menos uno",
};

function formatFechaSolicitud(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Aprobaciones pendientes card ──────────────────────────────────────────────

interface PendientesAprobacionProps {
    items: SgAprobacionResumenDTO[];
}

const PendientesAprobacionCard: React.FC<PendientesAprobacionProps> = ({ items }) => {
    const visible = items.slice(0, 6);
    const extras  = items.length - visible.length;

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden", borderColor: "#E2E5EA", height: "100%" }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2.5,
                    pt: 2,
                    pb: 1.5,
                    borderBottom: "1px solid #E2E5EA",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: items.length > 0 ? "#B45309" : "#16a34a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {items.length > 0
                            ? <PendingActionsIcon sx={{ fontSize: 22, color: "#fff" }} />
                            : <CheckCircleOutlineIcon sx={{ fontSize: 22, color: "#fff" }} />
                        }
                    </Box>
                    <Box>
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}
                        >
                            Mis aprobaciones
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                            <Typography variant="h4" fontWeight={700} color={C.dark} sx={{ lineHeight: 1.1 }}>
                                {items.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {items.length === 1 ? "pendiente" : "pendientes"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ── Lista ──────────────────────────────────────────────────── */}
            {items.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 36, color: "#16a34a", mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                        Sin pendientes — al día
                    </Typography>
                </Box>
            ) : (
                <>
                    {visible.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2.5,
                                    py: 1.1,
                                    gap: 1.5,
                                    "&:hover": { bgcolor: "#F9FAFB" },
                                }}
                            >
                                {/* Bullet de tipo */}
                                <Box
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        bgcolor: "#B45309",
                                        flexShrink: 0,
                                    }}
                                />

                                {/* Info principal */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color={C.dark}
                                        noWrap
                                    >
                                        {TIPO_LABEL[item.tipoDocumento] ?? item.tipoDocumento}
                                        {" "}
                                        <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                                            #{item.documentoId}
                                        </Typography>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {item.solicitanteNombre || item.solicitanteUsername}
                                        {" · "}
                                        {formatFechaSolicitud(item.fechaSolicitud)}
                                    </Typography>
                                </Box>

                                {/* Modo */}
                                <Chip
                                    label={MODO_LABEL[item.modoAprobacion] ?? item.modoAprobacion}
                                    size="small"
                                    sx={{
                                        fontSize: 10,
                                        height: 20,
                                        bgcolor: "#F4F5F7",
                                        color: C.d2,
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}
                                />
                            </Box>
                            {idx < visible.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                        </React.Fragment>
                    ))}

                    {extras > 0 && (
                        <Box sx={{ px: 2.5, py: 1, borderTop: "1px solid #E2E5EA" }}>
                            <Typography variant="caption" color="text.secondary">
                                +{extras} más — ve a Bandeja de aprobaciones
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Paper>
    );
};

// ── Entregas pendientes (hoy + mañana) ───────────────────────────────────────

const ESTADO_LABEL: Record<string, string> = {
    ACT: "Activo",
    PEN: "Pendiente",
    COM: "Completado",
    INA: "Inactivo",
};

const ESTADO_COLOR: Record<string, string> = {
    ACT: "#525C71",
    PEN: "#716752",
    COM: "#527158",
    INA: "#848EA5",
};

function formatTotal(v: number) {
    return v.toLocaleString("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 2 });
}

interface PedidoRowProps { item: OrdenCompraEntregaHoyDTO; last: boolean }

const PedidoRow: React.FC<PedidoRowProps> = ({ item, last }) => (
    <>
        <Box sx={{ display: "flex", alignItems: "center", px: 2.5, py: 0.9, gap: 1.5, "&:hover": { bgcolor: "#F9FAFB" } }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ESTADO_COLOR[item.estadoId] ?? C.mid, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} color={C.dark} noWrap>
                    {item.suplidorNombre}{" "}
                    <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                        #{item.id}
                    </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">{formatTotal(item.total)}</Typography>
            </Box>
            <Chip
                label={ESTADO_LABEL[item.estadoId] ?? item.estadoId}
                size="small"
                sx={{ fontSize: 10, height: 20, bgcolor: ESTADO_COLOR[item.estadoId] ?? C.mid, color: "#fff", fontWeight: 600, flexShrink: 0 }}
            />
        </Box>
        {!last && <Divider sx={{ mx: 2.5 }} />}
    </>
);

interface PedidosEntregaCardProps {
    hoy: OrdenCompraEntregaHoyDTO[];
    manana: OrdenCompraEntregaHoyDTO[];
}

const MAX_ROWS = 4;

const PedidosEntregaCard: React.FC<PedidosEntregaCardProps> = ({ hoy, manana }) => (
    <Paper elevation={0} variant="outlined"
        sx={{ borderRadius: 2, overflow: "hidden", borderColor: "#E2E5EA", height: "100%" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, pt: 2, pb: 1.5, borderBottom: "1px solid #E2E5EA" }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "#525C71",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LocalShippingIcon sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}>
                    Entregas pendientes
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 0.3 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography variant="h5" fontWeight={700} color={C.dark} sx={{ lineHeight: 1 }}>{hoy.length}</Typography>
                        <Typography variant="caption" color="text.secondary">hoy</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography variant="h5" fontWeight={700} color={C.d4} sx={{ lineHeight: 1 }}>{manana.length}</Typography>
                        <Typography variant="caption" color="text.secondary">mañana</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>

        {/* ── Sección HOY ────────────────────────────────────────────────── */}
        <Box sx={{ px: 2.5, pt: 1.2, pb: 0.5 }}>
            <Typography variant="caption" fontWeight={700} color={C.dark}
                sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10 }}>
                Hoy
            </Typography>
        </Box>
        {hoy.length === 0 ? (
            <Box sx={{ px: 2.5, pb: 1.2 }}>
                <Typography variant="caption" color="text.secondary">Sin entregas para hoy</Typography>
            </Box>
        ) : (
            <>
                {hoy.slice(0, MAX_ROWS).map((item, idx) => (
                    <PedidoRow key={item.id} item={item} last={idx === Math.min(hoy.length, MAX_ROWS) - 1} />
                ))}
                {hoy.length > MAX_ROWS && (
                    <Box sx={{ px: 2.5, py: 0.8 }}>
                        <Typography variant="caption" color="text.secondary">+{hoy.length - MAX_ROWS} más</Typography>
                    </Box>
                )}
            </>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* ── Sección MAÑANA ─────────────────────────────────────────────── */}
        <Box sx={{ px: 2.5, pt: 1, pb: 0.5 }}>
            <Typography variant="caption" fontWeight={700} color={C.d4}
                sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10 }}>
                Mañana
            </Typography>
        </Box>
        {manana.length === 0 ? (
            <Box sx={{ px: 2.5, pb: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Sin entregas para mañana</Typography>
            </Box>
        ) : (
            <>
                {manana.slice(0, MAX_ROWS).map((item, idx) => (
                    <PedidoRow key={item.id} item={item} last={idx === Math.min(manana.length, MAX_ROWS) - 1} />
                ))}
                {manana.length > MAX_ROWS && (
                    <Box sx={{ px: 2.5, py: 0.8 }}>
                        <Typography variant="caption" color="text.secondary">+{manana.length - MAX_ROWS} más</Typography>
                    </Box>
                )}
            </>
        )}
    </Paper>
);

// ── Dashboard principal ───────────────────────────────────────────────────────

const TODAS = "TODAS";   // valor centinela para "todas las sucursales"

const DashboardView: React.FC = () => {
    const [kpis, setKpis]                   = useState<DashboardKpiDTO[]>([]);
    const [ajustes, setAjustes]             = useState<DashboardAjusteBarDTO[]>([]);
    const [aprobaciones, setAprobaciones]   = useState<SgAprobacionResumenDTO[]>([]);
    const [pedidosHoy, setPedidosHoy]       = useState<OrdenCompraEntregaHoyDTO[]>([]);
    const [pedidosManana, setPedidosManana] = useState<OrdenCompraEntregaHoyDTO[]>([]);
    const [sucursales, setSucursales]       = useState<DashboardSucursalDTO[]>([]);
    const [sucursalSel, setSucursalSel]     = useState<string>(TODAS);
    const [loading, setLoading]             = useState(true);
    const [lastUpdate, setLastUpdate]       = useState<Date>(new Date());
    const mountDone                         = useRef(false);

    // Carga las sucursales accesibles una sola vez
    useEffect(() => {
        getDashboardSucursales()
            .then(setSucursales)
            .catch(() => {/* sin acceso: selector vacío */});
    }, []);

    const cargar = useCallback(async (sucId?: number) => {
        setLoading(true);
        try {
            const [kpiData, ajusteData, aprobData, pedidosHoyData, pedidosMananaData] = await Promise.all([
                getDashboardKpis(sucId),
                getDashboardAjustes(sucId),
                getMisPendientes(),
                getDashboardPedidosHoy(sucId),
                getDashboardPedidosManana(sucId),
            ]);
            setKpis(kpiData);
            setAjustes(ajusteData);
            setAprobaciones(aprobData);
            setPedidosHoy(pedidosHoyData);
            setPedidosManana(pedidosMananaData);
            setLastUpdate(new Date());
        } catch {
            // Sin datos — no romper la pantalla
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial
    useEffect(() => {
        if (mountDone.current) return;
        mountDone.current = true;
        cargar();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Recarga automática al volver al tab/ventana
    useEffect(() => {
        const sucId = sucursalSel === TODAS ? undefined : Number(sucursalSel);
        const onFocus = () => cargar(sucId);
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [sucursalSel, cargar]);

    const handleSucursalChange = (e: SelectChangeEvent) => {
        const val = e.target.value;
        setSucursalSel(val);
        cargar(val === TODAS ? undefined : Number(val));
    };

    return (
        <Box sx={{ p: 2.5 }}>
            {/* ── Cabecera ─────────────────────────────────────────────── */}
            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700} color={C.dark}>
                        Resumen de operaciones
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Actualizado: {lastUpdate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                        <Tooltip title="Actualizar datos">
                            <IconButton
                                size="small"
                                disabled={loading}
                                onClick={() => cargar(sucursalSel === TODAS ? undefined : Number(sucursalSel))}
                                sx={{ color: C.d4, p: 0.4 }}
                            >
                                <RefreshIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Selector de sucursal — solo visible si el usuario tiene más de una */}
                {sucursales.length > 1 && (
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>Sucursal</InputLabel>
                        <Select
                            label="Sucursal"
                            value={sucursalSel}
                            onChange={handleSucursalChange}
                        >
                            <MenuItem value={TODAS}>
                                <em>Todas las sucursales</em>
                            </MenuItem>
                            {sucursales.map((s) => (
                                <MenuItem key={s.id} value={String(s.id)}>
                                    {s.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>

            {/* ── Contenido ────────────────────────────────────────────── */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                    <CircularProgress sx={{ color: C.mid }} />
                </Box>
            ) : kpis.length === 0 ? (
                <Box sx={{ pt: 8, textAlign: "center" }}>
                    <Typography color="text.secondary">
                        No hay módulos disponibles para mostrar en el dashboard.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2.5}>
                    {kpis.map((kpi) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={kpi.modulo}>
                            <KpiCard kpi={kpi} />
                        </Grid>
                    ))}
                    {/* Entregas hoy + mañana — siempre visible, primera posición */}
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <PedidosEntregaCard hoy={pedidosHoy} manana={pedidosManana} />
                    </Grid>

                    {/* Ajustes de inventario */}
                    {ajustes.length > 0 && (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <AjustesBarChart data={ajustes} />
                        </Grid>
                    )}

                    {/* Aprobaciones — ocupa el espacio restante, reducida cuando hay ajustes */}
                    <Grid size={{ xs: 12, sm: 6, lg: ajustes.length > 0 ? 4 : 8 }}>
                        <PendientesAprobacionCard items={aprobaciones} />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default DashboardView;
