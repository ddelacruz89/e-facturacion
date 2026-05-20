import React, { useState, useEffect, useCallback } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentIcon from "@mui/icons-material/Payment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { getFacturaSuplidorBySecuencia } from "../../apis/FacturaSuplidorController";
import {
    buscarPagosSuplidor,
    savePagoSuplidor,
} from "../../apis/FacturaSuplidorPagosController";
import { getAllFormasPago } from "../../apis/FormaPagoSuplidorController";
import { MfFacturaSuplidor } from "../../models/facturacion/MfFacturaSuplidor";
import {
    MfFacturaSuplidorFormaPago,
    MfFacturaSuplidorPagosResumen,
} from "../../models/facturacion/MfFacturaSuplidorPagos";

// ── Estilos ───────────────────────────────────────────────────────────────────
const C = {
    teal:      "#17a589",
    tealDark:  "#148f77",
    tableHead: "#4a5568",
    labelColor:"#6b7280",
    bgGray:    "#f9fafb",
};

const labelSx = { fontSize: 11, fontWeight: 700, color: C.labelColor, textTransform: "uppercase" as const, mb: 0.3 };
const readSx  = { bgcolor: "#f3f4f6" };

const fmt = (v: number | string | undefined | null) =>
    `RD$ ${Number(v ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (v?: string) => v ? v.slice(0, 10) : "—";

const TIPO_PAGO: Record<string, string> = { "1": "Contado", "2": "Crédito", "3": "Gratuito" };

// ── Tipo de renglón de pago local ─────────────────────────────────────────────
interface PagoLine {
    _key:      number;
    formaPagoId?: number;
    formaPagoNombre: string;
    numeroReferencia: string;
    concepto:  string;
    montoPagado: number;
}

let _key = 0;
const emptyLine = (): PagoLine => ({
    _key: ++_key,
    formaPagoId: undefined,
    formaPagoNombre: "",
    numeroReferencia: "",
    concepto: "Pago Fact.",
    montoPagado: 0,
});

// ── Componente principal ──────────────────────────────────────────────────────
export default function FacturaSuplidorPagosView() {

    // ── factura cargada (header) ─────────────────────────────────────────────
    const [secuenciaInput, setSecuenciaInput] = useState<string>("");  // display
    const [factura, setFactura]               = useState<MfFacturaSuplidor | null>(null);

    // ── pagos existentes ─────────────────────────────────────────────────────
    const [pagos, setPagos]             = useState<MfFacturaSuplidorPagosResumen[]>([]);

    // ── pago pendiente (confirmado en modal, aún no guardado) ────────────────
    const [pendingLines, setPendingLines] = useState<PagoLine[] | null>(null);

    // ── catálogos ────────────────────────────────────────────────────────────
    const [formasPago, setFormasPago]   = useState<MfFacturaSuplidorFormaPago[]>([]);

    // ── modal hacer pago ─────────────────────────────────────────────────────
    const [pagoOpen, setPagoOpen]       = useState(false);
    const [lines, setLines]             = useState<PagoLine[]>([]);
    const [lineForm, setLineForm]       = useState<Omit<PagoLine, "_key">>({
        formaPagoId: undefined, formaPagoNombre: "", numeroReferencia: "", concepto: "Pago Fact.", montoPagado: 0,
    });
    const [saving, setSaving]           = useState(false);

    // ── snackbar ─────────────────────────────────────────────────────────────
    const [snackOpen, setSnackOpen]     = useState(false);
    const [snackMsg, setSnackMsg]       = useState("");
    const [snackSev, setSnackSev]       = useState<"success"|"error">("success");

    // ── modal search ─────────────────────────────────────────────────────────
    const searchFactura = useModalSearch();

    useEffect(() => { getAllFormasPago().then(setFormasPago); }, []);

    // ── cargar factura (helper interno, recibe la entidad completa) ─────────────
    const cargarFacturaData = useCallback(async (data: MfFacturaSuplidor) => {
        setFactura(data);
        setSecuenciaInput(String(data.secuencia ?? data.id));
        setPendingLines(null);
        const lista = await buscarPagosSuplidor({ facturaSuplidorId: data.id! });
        setPagos(lista);
    }, []);

    const cargarPagos = async (id: number) => {
        const lista = await buscarPagosSuplidor({ facturaSuplidorId: id });
        setPagos(lista);
    };

    const handleSelectFactura = searchFactura.handleSelect(async (r: any) => {
        const data = await getFacturaSuplidorBySecuencia(r.secuencia ?? r.id);
        if (data) await cargarFacturaData(data);
    });

    const handleBuscarPorSecuencia = async () => {
        const seq = Number(secuenciaInput);
        if (!seq) return;
        const data = await getFacturaSuplidorBySecuencia(seq);
        if (data) {
            await cargarFacturaData(data);
        } else {
            showMsg(`No se encontró factura No. ${seq}`, "error");
            setSecuenciaInput("");
            setFactura(null);
        }
    };

    // ── cálculos ─────────────────────────────────────────────────────────────
    // El suplidor no recibe las retenciones: se descuentan del total bruto
    const totalFactura  = Number(factura?.total ?? 0)
        - Number(factura?.montoRetencionItbis ?? 0)
        - Number(factura?.montoRetencionIsr   ?? 0);
    const pagadoDB      = pagos
        .filter(p => p.estadoId !== "ANU")
        .reduce((s, p) => s + Number(p.pagado ?? p.monto ?? 0), 0);
    const pendingTotal  = pendingLines
        ? pendingLines.reduce((s, l) => s + Number(l.montoPagado || 0), 0)
        : 0;
    const pagado        = pagadoDB + pendingTotal;
    const restante      = totalFactura - pagado;

    // ── modal hacer pago ─────────────────────────────────────────────────────
    const abrirPago = () => {
        if (!factura) { showMsg("Cargue una factura primero.", "error"); return; }
        setLines(pendingLines ? [...pendingLines] : []);
        setLineForm({ formaPagoId: undefined, formaPagoNombre: "", numeroReferencia: "", concepto: "Pago Fact.", montoPagado: 0 });
        setPagoOpen(true);
    };

    const agregarLinea = () => {
        if (!lineForm.formaPagoId) {
            showMsg("Seleccione una forma de pago.", "error"); return;
        }
        if (!lineForm.montoPagado || lineForm.montoPagado <= 0) {
            showMsg("Ingrese un monto mayor a 0.", "error"); return;
        }
        setLines(prev => [...prev, { ...lineForm, _key: ++_key }]);
        setLineForm({ formaPagoId: undefined, formaPagoNombre: "", numeroReferencia: "", concepto: "Pago Fact.", montoPagado: 0 });
    };

    const eliminarLinea = (key: number) =>
        setLines(prev => prev.filter(l => l._key !== key));

    const totalPago     = lines.reduce((s, l) => s + Number(l.montoPagado || 0), 0);
    const restantePago  = totalFactura - pagadoDB - totalPago;

    const confirmarPago = () => {
        if (lines.length === 0 || lines.every(l => !l.montoPagado || l.montoPagado <= 0)) {
            showMsg("Agregue al menos un renglón con monto.", "error"); return;
        }
        if (totalPago > totalFactura - pagadoDB) {
            showMsg(`El monto ingresado (${fmt(totalPago)}) supera el saldo pendiente (${fmt(totalFactura - pagadoDB)}).`, "error"); return;
        }
        setPendingLines([...lines]);
        setPagoOpen(false);
    };

    const handleGuardar = async () => {
        if (!factura || !pendingLines || pendingLines.length === 0) return;
        setSaving(true);
        try {
            await savePagoSuplidor({
                facturaSuplidorId: factura.id!,
                monto:    totalFactura,
                pagado:   pendingTotal,
                estadoId: "ACT",
                detalles: pendingLines.map(l => ({
                    formaPagoId:      l.formaPagoId,
                    numeroReferencia: l.numeroReferencia,
                    montoPagado:      l.montoPagado,
                    concepto:         l.concepto,
                    tipoPago:         1,
                    estado:           "ACT",
                })),
            });
            showMsg("Pago registrado correctamente.");
            setPendingLines(null);
            await cargarPagos(factura.id!);
        } catch {
            showMsg("Error al registrar el pago.", "error");
        } finally {
            setSaving(false);
        }
    };

    const showMsg = (msg: string, sev: "success"|"error" = "success") => {
        setSnackMsg(msg); setSnackSev(sev); setSnackOpen(true);
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>

            {/* ── Action bar ───────────────────────────────────────────────── */}
            <ActionBar title="Pagos Facturas Suplidor">
                <Button
                    variant="contained" color="primary"
                    disabled={!pendingLines || saving}
                    onClick={handleGuardar}
                >
                    {saving ? "Guardando…" : "Guardar"}
                </Button>
            </ActionBar>

            <Box sx={{ p: 2.5 }}>

                {/* ── Fila 1: CODIGO, SUPLIDOR, Tipo Comprobante, CONCEPTO ── */}
                <Grid container spacing={1.5} alignItems="flex-end" sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Typography sx={labelSx}>No.</Typography>
                        <TextField
                            fullWidth size="small"
                            placeholder="No. factura"
                            value={secuenciaInput}
                            onChange={e => setSecuenciaInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleBuscarPorSecuencia()}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                sx={{ bgcolor: C.teal, color: "#fff", borderRadius: 1, "&:hover": { bgcolor: C.tealDark } }}
                                                onClick={() => searchFactura.openModal(SEARCH_CONFIGS.FACTURA_SUPLIDOR)}
                                            >
                                                <SearchIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={labelSx}>Suplidor</Typography>
                        <TextField fullWidth size="small" value={factura?.suplidor?.nombre ?? ""} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={labelSx}>Tipo de Comprobante</Typography>
                        <TextField fullWidth size="small" value={factura?.tipoCfId ?? "No Asignar"} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={labelSx}>Concepto</Typography>
                        <TextField fullWidth size="small" value={factura?.concepto ?? ""} disabled sx={readSx} />
                    </Grid>
                </Grid>

                {/* ── Fila 2: No.Factura, NCF, Fecha Venc, Tipo de Pago, Ret Itbis, Ret ISR ── */}
                <Grid container spacing={1.5} alignItems="flex-end" sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>No. Factura</Typography>
                        <TextField fullWidth size="small" value={factura?.numeroFactura ?? ""} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>NCF</Typography>
                        <TextField fullWidth size="small" value={factura?.ncf ?? ""} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Fecha Vencimiento</Typography>
                        <TextField fullWidth size="small" value={fmtDate(factura?.fechaVencimiento)} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Tipo de Pago</Typography>
                        <TextField fullWidth size="small" value={TIPO_PAGO[String(factura?.tipoPago ?? "")] ?? ""} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Retención Itbis</Typography>
                        <TextField fullWidth size="small" value={factura?.retencionItbis?.descripcion ?? ""} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Retención ISR</Typography>
                        <TextField fullWidth size="small" value={factura?.retencionIsr?.descripcion ?? ""} disabled sx={readSx} />
                    </Grid>
                </Grid>

                {/* ── Fila 3: MONTO, ITBIS, ITBIS RETENIDO, ISR RETENIDO, TOTAL A PAGAR ── */}
                <Grid container spacing={1.5} alignItems="flex-end" sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Monto</Typography>
                        <TextField fullWidth size="small" value={fmt(factura?.subTotal)} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Itbis</Typography>
                        <TextField fullWidth size="small" value={fmt(factura?.itbis)} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Itbis Retenido</Typography>
                        <TextField fullWidth size="small" value={fmt(factura?.montoRetencionItbis)} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>ISR Retenido</Typography>
                        <TextField fullWidth size="small" value={fmt(factura?.montoRetencionIsr)} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Total a Pagar</Typography>
                        <TextField fullWidth size="small" value={fmt(totalFactura)} disabled
                            sx={{ bgcolor: "#f3f4f6", "& input": { fontWeight: 700 } }} />
                    </Grid>
                </Grid>

                {/* ── Botones acción ────────────────────────────────────────── */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={abrirPago}
                        disabled={!factura}
                        sx={{ bgcolor: C.teal, "&:hover": { bgcolor: C.tealDark }, textTransform: "none", fontWeight: 600 }}
                    >
                        Hacer Pago
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ListAltIcon />}
                        disabled={!factura}
                        sx={{ bgcolor: "#4a5568", "&:hover": { bgcolor: "#2d3748" }, textTransform: "none", fontWeight: 600 }}
                    >
                        Ver Origen
                    </Button>
                </Box>

                {/* ── PAGADO / RESTANTE ─────────────────────────────────────── */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Pagado</Typography>
                        <TextField fullWidth size="small" value={fmt(pagado)} disabled sx={readSx} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography sx={labelSx}>Restante</Typography>
                        <TextField fullWidth size="small" value={fmt(restante)} disabled
                            sx={{ bgcolor: restante > 0 ? "#fff3cd" : "#d1fae5" }} />
                    </Grid>
                </Grid>

                {/* ── Tabla de pagos existentes ─────────────────────────────── */}
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: C.tableHead }}>
                                <TableCell align="center" sx={{ color: "#fff", fontWeight: 700, width: "33%" }}>Monto</TableCell>
                                <TableCell align="center" sx={{ color: "#fff", fontWeight: 700, width: "34%" }}>Fecha Pago</TableCell>
                                <TableCell align="center" sx={{ color: "#fff", fontWeight: 700, width: "33%" }}>Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pagos.length === 0 && !pendingLines ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ color: C.labelColor, py: 2 }}>
                                        No hay pagos a esta factura
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {pagos.map(p => (
                                        <TableRow key={p.id} hover>
                                            <TableCell align="right">{fmt(p.monto)}</TableCell>
                                            <TableCell align="center">{fmtDate(p.fechaPago)}</TableCell>
                                            <TableCell align="center">{p.estadoId}</TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingLines && (
                                        <TableRow sx={{ bgcolor: "#fff3cd" }}>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(pendingTotal)}</TableCell>
                                            <TableCell align="center" sx={{ color: C.labelColor }}>—</TableCell>
                                            <TableCell align="center">
                                                <Box component="span" sx={{ bgcolor: "#f59e0b", color: "#fff", px: 1, py: 0.3, borderRadius: 1, fontSize: 11, fontWeight: 700 }}>
                                                    PENDIENTE
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* ══ Modal: Método de Pago ══════════════════════════════════════ */}
            <Dialog open={pagoOpen} onClose={() => setPagoOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: C.teal, color: "#fff", fontWeight: 700, py: 1.5 }}>
                    Método de Pago
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>

                    {/* ── Fila de entrada ─────────────────────────────────── */}
                    <Grid container spacing={1.5} alignItems="flex-end" sx={{ mb: 1.5 }}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography sx={labelSx}>Forma de Pago</Typography>
                            <TextField
                                fullWidth size="small" select
                                value={lineForm.formaPagoId ?? ""}
                                onChange={e => {
                                    const id = Number(e.target.value);
                                    const fp = formasPago.find(f => f.id === id);
                                    setLineForm(prev => ({ ...prev, formaPagoId: id, formaPagoNombre: fp?.formaPago ?? "" }));
                                }}
                            >
                                <MenuItem value="">— Elija una opción —</MenuItem>
                                {formasPago.map(fp => (
                                    <MenuItem key={fp.id} value={fp.id}>{fp.formaPago}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <Typography sx={labelSx}>No. Referencia</Typography>
                            <TextField
                                fullWidth size="small"
                                value={lineForm.numeroReferencia}
                                onChange={e => setLineForm(prev => ({ ...prev, numeroReferencia: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <Typography sx={labelSx}>Monto</Typography>
                            <TextField
                                fullWidth size="small" type="number"
                                value={lineForm.montoPagado || ""}
                                onChange={e => setLineForm(prev => ({ ...prev, montoPagado: Number(e.target.value) }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography sx={labelSx}>Concepto</Typography>
                            <TextField
                                fullWidth size="small"
                                value={lineForm.concepto}
                                onChange={e => setLineForm(prev => ({ ...prev, concepto: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <Button
                                fullWidth variant="contained" startIcon={<AddIcon />}
                                onClick={agregarLinea}
                                sx={{ bgcolor: C.tableHead, "&:hover": { bgcolor: "#2d3748" }, textTransform: "none" }}
                            >
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>

                    {/* ── Tabla de renglones ───────────────────────────────── */}
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: C.tableHead }}>
                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Forma Pago</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Referencia</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Concepto</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">Pago</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 700, width: 40 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ color: C.labelColor }}>
                                            No hay data
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lines.map(l => (
                                        <TableRow key={l._key} hover>
                                            <TableCell>{l.formaPagoNombre || "—"}</TableCell>
                                            <TableCell>{l.numeroReferencia || "—"}</TableCell>
                                            <TableCell>{l.concepto}</TableCell>
                                            <TableCell align="right">{fmt(l.montoPagado)}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => eliminarLinea(l._key)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider sx={{ mb: 2 }} />

                    {/* ── Totales ──────────────────────────────────────────── */}
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography sx={labelSx}>Total</Typography>
                            <TextField fullWidth size="small" value={fmt(totalFactura)} disabled sx={readSx} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography sx={labelSx}>Ya Pagado</Typography>
                            <TextField fullWidth size="small" value={fmt(pagado)} disabled sx={readSx} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography sx={labelSx}>Este Pago</Typography>
                            <TextField fullWidth size="small" value={fmt(totalPago)} disabled
                                sx={{ bgcolor: "#e0f2fe" }} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography sx={labelSx}>Restante</Typography>
                            <TextField fullWidth size="small" value={fmt(restantePago)} disabled
                                sx={{ bgcolor: restantePago > 0 ? "#fff3cd" : "#d1fae5" }} />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button
                        fullWidth variant="contained"
                        onClick={() => setPagoOpen(false)}
                        sx={{ bgcolor: C.tableHead, "&:hover": { bgcolor: "#2d3748" }, textTransform: "none", fontWeight: 600 }}
                    >
                        Cerrar
                    </Button>
                    <Button
                        fullWidth variant="contained"
                        onClick={confirmarPago}
                        sx={{ bgcolor: C.teal, "&:hover": { bgcolor: C.tealDark }, textTransform: "none", fontWeight: 600 }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Modal búsqueda factura ──────────────────────────────────── */}
            {searchFactura.config && (
                <ModalSearch
                    config={searchFactura.config}
                    open={searchFactura.isOpen}
                    onClose={searchFactura.closeModal}
                    onSelect={handleSelectFactura}
                />
            )}

            {/* ── Snackbar ────────────────────────────────────────────────── */}
            <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={snackSev} onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
            </Snackbar>
        </Box>
    );
}
