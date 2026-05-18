import React, { useState, useEffect, useCallback } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Key } from "@mui/icons-material";
import { yellow } from "@mui/material/colors";
import ActionBar from "../../customers/ActionBar";
import { ConfirmationModal } from "../../customers/CustomComponents";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import {
    getFormasPagoSuplidor,
    getPagoSuplidorById,
    savePagoSuplidor,
    updatePagoSuplidor,
    anularPagoSuplidor,
} from "../../apis/FacturaSuplidorPagosController";
import { getFacturaSuplidorById } from "../../apis/FacturaSuplidorController";
import {
    MfFacturaSuplidorFormaPago,
    MfFacturaSuplidorPagos,
    MfFacturaSuplidorPagosDetalleRequest,
    MfFacturaSuplidorPagosRequest,
} from "../../models/facturacion/MfFacturaSuplidorPagos";

// ── Paleta ────────────────────────────────────────────────────────────────────
const COLOR = {
    navDark:   "#2c3e50",
    tableHead: "#34495e",
    sectionBg: "#f8f9fa",
    accentTeal:"#17a589",
    labelGray: "#6c757d",
    totalsRow: "#eaf4fb",
};

const fmt = (v: number | undefined) =>
    (v ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getDRToday(): string {
    const now   = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
    const dr    = new Date(utcMs - 4 * 60 * 60_000);
    return dr.toISOString().slice(0, 16);
}

// ── Tipos locales ─────────────────────────────────────────────────────────────
interface DetalleLocal extends MfFacturaSuplidorPagosDetalleRequest {
    _key: number;
}

let _keyCounter = 0;
const makeDetalle = (): DetalleLocal => ({
    _key: ++_keyCounter,
    montoPagado: 0,
    formaPagoId: undefined,
    numeroReferencia: "",
    concepto: "",
    tipoPago: 1,
    estado: "ACT",
});

const INITIAL_HEADER = {
    facturaSuplidorId: 0,
    monto: 0,
    pagado: 0,
    fechaPago: getDRToday(),
    estadoId: "ACT",
    contableId: undefined as number | undefined,
};

export default function FacturaSuplidorPagosView() {
    // ── estado del formulario ────────────────────────────────────────────────
    const [selectedId, setSelectedId]     = useState<number | null>(null);
    const [estadoActual, setEstadoActual] = useState<string>("ACT");
    const [header, setHeader]             = useState({ ...INITIAL_HEADER });
    const [detalles, setDetalles]         = useState<DetalleLocal[]>([makeDetalle()]);
    const [facturaInfo, setFacturaInfo]   = useState<string>("");

    // ── catálogos ────────────────────────────────────────────────────────────
    const [formasPago, setFormasPago] = useState<MfFacturaSuplidorFormaPago[]>([]);

    // ── UI ───────────────────────────────────────────────────────────────────
    const [snackOpen, setSnackOpen]         = useState(false);
    const [snackMsg, setSnackMsg]           = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");
    const [confirmAnular, setConfirmAnular] = useState(false);
    const [saving, setSaving]               = useState(false);

    // ── modal search ─────────────────────────────────────────────────────────
    const searchPagos   = useModalSearch();
    const searchFactura = useModalSearch();

    // ── carga inicial ────────────────────────────────────────────────────────
    useEffect(() => {
        getFormasPagoSuplidor().then(setFormasPago);
    }, []);

    // ── handlers modal búsqueda ───────────────────────────────────────────────
    const handleSelectPago = searchPagos.handleSelect(async (resumen: any) => {
        const pago = await getPagoSuplidorById(resumen.id);
        if (pago) cargarPago(pago);
    });

    const handleSelectFactura = searchFactura.handleSelect(async (resumen: any) => {
        const factura = await getFacturaSuplidorById(resumen.id);
        if (factura) {
            setHeader(prev => ({
                ...prev,
                facturaSuplidorId: resumen.id,
                monto: Number(factura.total ?? 0),
            }));
            setFacturaInfo(`#${resumen.id} — ${resumen.suplidorNombre ?? ""} | Total: ${fmt(factura.total)}`);
        }
    });

    const cargarPago = useCallback((pago: MfFacturaSuplidorPagos) => {
        setSelectedId(pago.id);
        setEstadoActual(pago.estadoId);
        setHeader({
            facturaSuplidorId: pago.facturaSuplidor?.id ?? 0,
            monto:     Number(pago.monto ?? 0),
            pagado:    Number(pago.pagado ?? 0),
            fechaPago: pago.fechaPago?.slice(0, 16) ?? getDRToday(),
            estadoId:  pago.estadoId,
            contableId: pago.contableId,
        });
        const loaded = (pago.detalles ?? []).map(d => ({
            _key: ++_keyCounter,
            montoPagado:      Number(d.montoPagado ?? 0),
            formaPagoId:      d.formaPago?.id,
            numeroReferencia: d.numeroReferencia ?? "",
            concepto:         d.concepto ?? "",
            tipoPago:         d.tipoPago ?? 1,
            estado:           d.estado ?? "ACT",
        }));
        setDetalles(loaded.length ? loaded : [makeDetalle()]);
        setFacturaInfo(`Factura #${pago.facturaSuplidor?.id}`);
    }, []);

    // ── CRUD ─────────────────────────────────────────────────────────────────
    const buildPayload = (): MfFacturaSuplidorPagosRequest => ({
        facturaSuplidorId: header.facturaSuplidorId,
        monto:      header.monto,
        pagado:     header.pagado,
        fechaPago:  header.fechaPago,
        estadoId:   header.estadoId,
        contableId: header.contableId,
        detalles:   detalles.map(({ _key, ...d }) => d),
    });

    const showMsg = (msg: string, severity: "success" | "error" = "success") => {
        setSnackMsg(msg);
        setSnackSeverity(severity);
        setSnackOpen(true);
    };

    const handleNew = () => {
        setSelectedId(null);
        setEstadoActual("ACT");
        setHeader({ ...INITIAL_HEADER, fechaPago: getDRToday() });
        setDetalles([makeDetalle()]);
        setFacturaInfo("");
    };

    const handleSave = async () => {
        if (!header.facturaSuplidorId) {
            showMsg("Debe seleccionar una factura de suplidor.", "error");
            return;
        }
        if (detalles.every(d => !d.montoPagado || d.montoPagado <= 0)) {
            showMsg("Agregue al menos un renglón de pago con monto.", "error");
            return;
        }
        setSaving(true);
        try {
            const payload = buildPayload();
            if (selectedId) {
                cargarPago(await updatePagoSuplidor(selectedId, payload));
                showMsg("Pago actualizado correctamente.");
            } else {
                cargarPago(await savePagoSuplidor(payload));
                showMsg("Pago registrado correctamente.");
            }
        } catch {
            showMsg("Error al guardar el pago.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAnular = async () => {
        if (!selectedId) return;
        setConfirmAnular(false);
        try {
            cargarPago(await anularPagoSuplidor(selectedId));
            showMsg("Pago anulado correctamente.");
        } catch {
            showMsg("Error al anular el pago.", "error");
        }
    };

    // ── detalles ──────────────────────────────────────────────────────────────
    const addDetalle = () => setDetalles(prev => [...prev, makeDetalle()]);

    const removeDetalle = (key: number) =>
        setDetalles(prev => prev.filter(d => d._key !== key));

    const updateDetalle = (key: number, field: keyof DetalleLocal, value: any) =>
        setDetalles(prev => prev.map(d => d._key === key ? { ...d, [field]: value } : d));

    const totalPagado = detalles.reduce((s, d) => s + Number(d.montoPagado || 0), 0);
    const isAnulado   = estadoActual === "ANU";

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ p: 2 }}>
            {/* ── Barra de acciones ─────────────────────────────────────── */}
            <ActionBar title="Pagos de Facturas Suplidor">
                <Button variant="outlined" size="small" onClick={handleNew}>
                    Nuevo
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => searchPagos.openModal(SEARCH_CONFIGS.PAGOS_SUPLIDOR)}
                >
                    Buscar
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={saving || isAnulado}
                >
                    {saving ? "Guardando…" : "Guardar"}
                </Button>
                {selectedId && !isAnulado && (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setConfirmAnular(true)}
                    >
                        Anular
                    </Button>
                )}
            </ActionBar>

            {/* ── PK y estado ───────────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="ID"
                            value={selectedId ?? ""}
                            disabled
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Key sx={{ color: yellow[700], rotate: "90deg" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Chip
                            label={isAnulado ? "ANULADO" : estadoActual}
                            color={isAnulado ? "error" : "success"}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* ── Factura suplidor ──────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: COLOR.sectionBg }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: COLOR.navDark, fontWeight: 700 }}>
                    Factura Suplidor
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="ID Factura"
                            type="number"
                            value={header.facturaSuplidorId || ""}
                            disabled={isAnulado}
                            onChange={e =>
                                setHeader(prev => ({ ...prev, facturaSuplidorId: Number(e.target.value) }))
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: "auto" }}>
                        <SearchButton
                            config={SEARCH_CONFIGS.FACTURA_SUPLIDOR}
                            onOpenSearch={searchFactura.openModal}
                            variant="icon"
                            disabled={isAnulado}
                            tooltip="Buscar Factura Suplidor"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 7 }}>
                        <Typography variant="body2" sx={{ color: COLOR.labelGray }}>
                            {facturaInfo || "—"}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* ── Datos del pago ────────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: COLOR.navDark, fontWeight: 700 }}>
                    Datos del Pago
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Fecha de Pago"
                            type="datetime-local"
                            value={header.fechaPago}
                            disabled={isAnulado}
                            slotProps={{ inputLabel: { shrink: true } }}
                            onChange={e => setHeader(prev => ({ ...prev, fechaPago: e.target.value }))}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Monto Factura"
                            type="number"
                            value={header.monto}
                            disabled={isAnulado}
                            onChange={e => setHeader(prev => ({ ...prev, monto: Number(e.target.value) }))}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Estado"
                            select
                            value={header.estadoId}
                            disabled={isAnulado}
                            onChange={e => setHeader(prev => ({ ...prev, estadoId: e.target.value }))}
                        >
                            <MenuItem value="ACT">Activo</MenuItem>
                            <MenuItem value="ANU">Anulado</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* ── Renglones de pago ─────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: COLOR.navDark, fontWeight: 700 }}>
                        Formas de Pago
                    </Typography>
                    {!isAnulado && (
                        <Button size="small" startIcon={<AddIcon />} onClick={addDetalle}
                            sx={{ color: COLOR.accentTeal }}>
                            Agregar renglón
                        </Button>
                    )}
                </Box>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: COLOR.tableHead }}>
                                <TableCell sx={{ color: "#fff", width: "22%" }}>Forma de Pago</TableCell>
                                <TableCell sx={{ color: "#fff", width: "18%" }}>No. Referencia</TableCell>
                                <TableCell sx={{ color: "#fff", width: "15%" }}>Monto Pagado</TableCell>
                                <TableCell sx={{ color: "#fff", width: "30%" }}>Concepto</TableCell>
                                <TableCell sx={{ color: "#fff", width: "10%" }}>Estado</TableCell>
                                {!isAnulado && <TableCell sx={{ width: "5%" }} />}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detalles.map(d => (
                                <TableRow key={d._key}>
                                    <TableCell>
                                        <TextField fullWidth size="small" select
                                            value={d.formaPagoId ?? ""}
                                            disabled={isAnulado}
                                            onChange={e => updateDetalle(d._key, "formaPagoId", Number(e.target.value))}
                                        >
                                            <MenuItem value="">— Seleccione —</MenuItem>
                                            {formasPago.map(fp => (
                                                <MenuItem key={fp.id} value={fp.id}>{fp.formaPago}</MenuItem>
                                            ))}
                                        </TextField>
                                    </TableCell>
                                    <TableCell>
                                        <TextField fullWidth size="small"
                                            value={d.numeroReferencia ?? ""}
                                            disabled={isAnulado}
                                            onChange={e => updateDetalle(d._key, "numeroReferencia", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField fullWidth size="small" type="number"
                                            value={d.montoPagado}
                                            disabled={isAnulado}
                                            onChange={e => updateDetalle(d._key, "montoPagado", Number(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField fullWidth size="small"
                                            value={d.concepto ?? ""}
                                            disabled={isAnulado}
                                            onChange={e => updateDetalle(d._key, "concepto", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField fullWidth size="small" select
                                            value={d.estado ?? "ACT"}
                                            disabled={isAnulado}
                                            onChange={e => updateDetalle(d._key, "estado", e.target.value)}
                                        >
                                            <MenuItem value="ACT">ACT</MenuItem>
                                            <MenuItem value="ANU">ANU</MenuItem>
                                        </TextField>
                                    </TableCell>
                                    {!isAnulado && (
                                        <TableCell>
                                            <IconButton size="small" color="error"
                                                onClick={() => removeDetalle(d._key)}
                                                disabled={detalles.length === 1}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}

                            <TableRow sx={{ bgcolor: COLOR.totalsRow }}>
                                <TableCell colSpan={2} align="right" sx={{ fontWeight: 700 }}>
                                    Total Pagado:
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{fmt(totalPagado)}</TableCell>
                                <TableCell colSpan={isAnulado ? 2 : 3} />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ── Resumen ───────────────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: COLOR.totalsRow }}>
                <Grid container spacing={2} justifyContent="flex-end">
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" sx={{ color: COLOR.labelGray }}>Monto Factura</Typography>
                        <Typography variant="h6">{fmt(header.monto)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" sx={{ color: COLOR.labelGray }}>Total Pagado</Typography>
                        <Typography variant="h6" sx={{ color: COLOR.accentTeal }}>{fmt(totalPagado)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" sx={{ color: COLOR.labelGray }}>Pendiente</Typography>
                        <Typography variant="h6"
                            sx={{ color: header.monto - totalPagado > 0 ? "error.main" : COLOR.accentTeal }}
                        >
                            {fmt(header.monto - totalPagado)}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* ── Modales de búsqueda ───────────────────────────────────── */}
            {searchPagos.config && (
                <ModalSearch
                    config={searchPagos.config}
                    open={searchPagos.isOpen}
                    onClose={searchPagos.closeModal}
                    onSelect={handleSelectPago}
                />
            )}
            {searchFactura.config && (
                <ModalSearch
                    config={searchFactura.config}
                    open={searchFactura.isOpen}
                    onClose={searchFactura.closeModal}
                    onSelect={handleSelectFactura}
                />
            )}

            {/* ── Confirmación anulación ────────────────────────────────── */}
            <ConfirmationModal
                open={confirmAnular}
                title="Anular Pago"
                message="¿Está seguro de que desea anular este pago? Esta acción no se puede deshacer."
                confirmColor="error"
                onConfirm={handleAnular}
                onCancel={() => setConfirmAnular(false)}
            />

            {/* ── Snackbar ──────────────────────────────────────────────── */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
