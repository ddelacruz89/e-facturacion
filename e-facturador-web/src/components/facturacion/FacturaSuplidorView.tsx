import React, { useState, useEffect, useCallback } from "react";
import {
    Alert,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import GridOnIcon from "@mui/icons-material/GridOn";
import ActionBar from "../../customers/ActionBar";
import { SuplidorComboBox } from "../../customers/ProductComboBoxes";
import { getItbisActivos } from "../../apis/ItbisController";
import { MgItbis } from "../../models/facturacion";
import { getRetencionesPorTipo, MgRetencionItbisResumen } from "../../apis/RetencionItbisController";
import { TextInputPk, ConfirmationModal } from "../../customers/CustomComponents";
import { TipoComprobanteSelect } from "../../customers/ComboBox";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import {
    getFacturaSuplidorById,
    saveFacturaSuplidor,
    updateFacturaSuplidor,
} from "../../apis/FacturaSuplidorController";
import {
    MfFacturaSuplidorRequest,
    MfFacturaSuplidorDetalleRequest,
} from "../../models/facturacion/MfFacturaSuplidor";

// ── Paleta ────────────────────────────────────────────────────────────────────
const COLOR = {
    navDark:    "#2c3e50",
    tableHead:  "#34495e",
    sectionBg:  "#f8f9fa",
    cardBorder: "#dee2e6",
    accentTeal: "#17a589",
    labelGray:  "#6c757d",
    totalsRow:  "#eaf4fb",
};

// ── Tipos auxiliares ──────────────────────────────────────────────────────────
interface PendingRetencionChange {
    tipo:        "ISR" | "ITBIS";
    id:          number | undefined;
    valor:       number;
    descripcion: string;
}

// ── Estado inicial ────────────────────────────────────────────────────────────
const INITIAL_FORM: MfFacturaSuplidorRequest = {
    estadoId:            "ACT",
    descuento:           0,
    itbis:               0,
    subtotal:            0,
    total:               0,
    montoAnulado:        0,
    montoRetencionIsr:   0,
    montoRetencionItbis: 0,
    detalles:            [],
};

interface DetalleLocal extends MfFacturaSuplidorDetalleRequest {
    itbisNombre?: string;
}

const makeInitialDetalle = (isrPct: number, itbisPct: number): DetalleLocal => ({
    cantidad:               1,
    precioUnitario:         0,
    itbisId:                0,
    itbisPorciento:         0,
    montoItem:              0,
    itbis:                  0,
    montoItbisRetenido:     0,
    retencion:              0,
    retencionIsrPorciento:  isrPct,
    retencionItbisPorciento: itbisPct,
    subtotal:               0,
    total:                  0,
    indicadorBienServicio:  1,
    montoDescuento:         0,
});

const ESTADOS       = [{ value:"ACT",label:"Activo"},{ value:"PEN",label:"Pendiente"},{ value:"PAG",label:"Pagada"},{ value:"ANU",label:"Anulada"}];
const TIPOS_PAGO    = [{ value:1,label:"Contado"},{ value:2,label:"Crédito"},{ value:3,label:"Mixto"}];
const TIPOS_RETENCION = [{ value:"",label:"Seleccione Tipo"},{ value:"ISR",label:"ISR"},{ value:"ITBIS",label:"ITBIS"},{ value:"AMBOS",label:"Ambos"}];

function fmt(v: number | undefined): string {
    if (v == null) return "0.00";
    return Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmt4(v: number | undefined): string {
    if (v == null) return "0.0000";
    return Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="caption" fontWeight={600} color={COLOR.labelGray} display="block" mb={0.3}>
            {children}
        </Typography>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
const FacturaSuplidorView: React.FC = () => {
    const [snackOpen, setSnackOpen]         = useState(false);
    const [snackMsg, setSnackMsg]           = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");
    const [showConfirm, setShowConfirm]     = useState(false);
    const [pendingData, setPendingData]     = useState<MfFacturaSuplidorRequest | null>(null);
    const [accordionOpen, setAccordionOpen] = useState(true);

    // Retenciones activas (porcentajes propagados al detalle)
    const [isrPct,  setIsrPct]  = useState(0);
    const [itbisPct, setItbisPct] = useState(0);

    // Cambio de retención pendiente de confirmación
    const [pendingRet, setPendingRet] = useState<PendingRetencionChange | null>(null);

    const [detalleForm, setDetalleForm]         = useState<DetalleLocal>(() => makeInitialDetalle(0, 0));
    const [itbisOpciones, setItbisOpciones]     = useState<MgItbis[]>([]);
    const [retencionesItbis, setRetencionesItbis] = useState<MgRetencionItbisResumen[]>([]);
    const [retencionesIsr, setRetencionesIsr]   = useState<MgRetencionItbisResumen[]>([]);

    useEffect(() => {
        getItbisActivos().then(setItbisOpciones).catch(() => {});
        getRetencionesPorTipo("ITBIS").then(setRetencionesItbis).catch(() => {});
        getRetencionesPorTipo("ISR").then(setRetencionesIsr).catch(() => {});
    }, []);

    const facturaSearch = useModalSearch();

    const { control, handleSubmit, reset, setValue, watch, register, formState: { errors } } =
        useForm<MfFacturaSuplidorRequest>({ defaultValues: INITIAL_FORM });

    const { fields, append, remove } = useFieldArray({ control, name: "detalles" });
    const detalles = watch("detalles");

    // ── Recalc detalle ────────────────────────────────────────────────────────
    const recalcDetalle = useCallback((d: DetalleLocal, newIsrPct?: number, newItbisPct?: number): DetalleLocal => {
        const usedIsrPct   = newIsrPct   ?? d.retencionIsrPorciento   ?? isrPct;
        const usedItbisPct = newItbisPct ?? d.retencionItbisPorciento ?? itbisPct;

        const montoItem          = (d.cantidad || 0) * (d.precioUnitario || 0);
        const itbisAmt           = montoItem * ((d.itbisPorciento || 0) / 100);
        const subtotal           = montoItem - (d.montoDescuento || 0) + (d.montoRecargo || 0);
        const retencion          = subtotal  * (usedIsrPct   / 100);
        const montoItbisRetenido = itbisAmt  * (usedItbisPct / 100);
        const total              = subtotal  + itbisAmt;

        return {
            ...d,
            montoItem,
            itbis: itbisAmt,
            subtotal,
            retencion,
            montoItbisRetenido,
            total,
            retencionIsrPorciento:   usedIsrPct,
            retencionItbisPorciento: usedItbisPct,
        };
    }, [isrPct, itbisPct]);

    // ── Cambio de retención en cabecera ───────────────────────────────────────
    const handleRetencionChange = (tipo: "ISR" | "ITBIS", rawId: string) => {
        const id    = Number(rawId) || undefined;
        const list  = tipo === "ISR" ? retencionesIsr : retencionesItbis;
        const ret   = list.find((r) => r.id === id);
        const valor = ret?.valor ?? 0;

        if (fields.length > 0) {
            // Hay ítems en la tabla → pedir confirmación
            setPendingRet({ tipo, id, valor, descripcion: ret?.descripcion ?? "Ninguna" });
        } else {
            // No hay ítems → aplicar directo
            applyRetencion(tipo, id, valor);
        }
    };

    const applyRetencion = (tipo: "ISR" | "ITBIS", id: number | undefined, valor: number) => {
        if (tipo === "ISR") {
            setValue("retencionIsrId", id);
            setIsrPct(valor);
            setDetalleForm((prev) => recalcDetalle(prev, valor, itbisPct));
        } else {
            setValue("retencionItbisId", id);
            setItbisPct(valor);
            setDetalleForm((prev) => recalcDetalle(prev, isrPct, valor));
        }
        // montoRetencion* se calcula automáticamente en recalcTotals al agregar renglones
    };

    const handleConfirmRetencionChange = () => {
        if (!pendingRet) return;
        // Limpiar tabla
        for (let i = fields.length - 1; i >= 0; i--) remove(i);
        recalcTotals([]);
        applyRetencion(pendingRet.tipo, pendingRet.id, pendingRet.valor);
        setPendingRet(null);
    };

    const handleCancelRetencionChange = () => setPendingRet(null);

    // ── Búsqueda modal ────────────────────────────────────────────────────────
    const handleFacturaSelect = facturaSearch.handleSelect(async (resumen: any) => {
        const completa = await getFacturaSuplidorById(resumen.id);
        if (!completa) return;

        const loadedIsrPct   = completa.retencionIsr?.valor   ?? 0;
        const loadedItbisPct = completa.retencionItbis?.valor ?? 0;
        setIsrPct(loadedIsrPct);
        setItbisPct(loadedItbisPct);

        reset({
            id:                  completa.id,
            suplidorId:          completa.suplidor?.id ?? completa.suplidorId,
            numeroFactura:       completa.numeroFactura,
            ncf:                 completa.ncf,
            tipoCfId:            completa.tipoCfId,
            fechaEmision:        completa.fechaEmision,
            fechaLimitePago:     completa.fechaLimitePago,
            fechaVencimiento:    completa.fechaVencimiento,
            tipoFacturaId:       completa.tipoFactura?.id ?? completa.tipoFacturaId,
            tipoPago:            completa.tipoPago,
            tipoIngreso:         completa.tipoIngreso,
            concepto:            completa.concepto,
            estadoId:            completa.estadoId,
            subtotal:            completa.subtotal,
            itbis:               completa.itbis,
            descuento:           completa.descuento,
            total:               completa.total,
            pago:                completa.pago,
            retencionIsrId:      completa.retencionIsr?.id   ?? completa.retencionIsrId,
            montoRetencionIsr:   completa.montoRetencionIsr,
            retencionItbisId:    completa.retencionItbis?.id ?? completa.retencionItbisId,
            montoRetencionItbis: completa.montoRetencionItbis,
            esCredito:           completa.esCredito,
            detalles:            completa.detalles ?? [],
        });
    });

    // ── Detalle helpers ───────────────────────────────────────────────────────
    const handleDetalleField = (field: keyof DetalleLocal, value: any) =>
        setDetalleForm((prev) => recalcDetalle({ ...prev, [field]: value }));

    const handleItbisSelect = (itbisId: number, itbisPorciento: number, nombre: string) =>
        setDetalleForm((prev) => recalcDetalle({ ...prev, itbisId, itbisPorciento, itbisNombre: nombre }));

    const handleAddDetalle = () => {
        if (!detalleForm.itbisId) { showSnack("Seleccione el ITBIS del renglón", "error"); return; }
        append({ ...detalleForm });
        recalcTotals([...detalles, detalleForm]);
        setDetalleForm(makeInitialDetalle(isrPct, itbisPct));
    };

    const handleRemoveDetalle = (idx: number) => {
        remove(idx);
        const next = [...detalles]; next.splice(idx, 1);
        recalcTotals(next);
    };

    const recalcTotals = (rows: any[]) => {
        let subtotal = 0, itbis = 0, total = 0, isrRet = 0, itbisRet = 0;
        rows.forEach((r) => {
            subtotal  += Number(r.subtotal)           || 0;
            itbis     += Number(r.itbis)              || 0;
            total     += Number(r.total)              || 0;
            isrRet    += Number(r.retencion)          || 0;
            itbisRet  += Number(r.montoItbisRetenido) || 0;
        });
        setValue("subtotal",            subtotal);
        setValue("itbis",               itbis);
        setValue("total",               total);
        setValue("montoRetencionIsr",   isrRet);
        setValue("montoRetencionItbis", itbisRet);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit: SubmitHandler<MfFacturaSuplidorRequest> = (data) => {
        if (!data.suplidorId)                             { showSnack("Seleccione un suplidor", "error");        return; }
        if (!data.tipoFacturaId)                          { showSnack("Seleccione el tipo de factura", "error"); return; }
        if (!data.detalles || data.detalles.length === 0) { showSnack("Agregue al menos un renglón", "error");  return; }
        setPendingData(data); setShowConfirm(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;
        try {
            pendingData.id
                ? await updateFacturaSuplidor(pendingData.id, pendingData)
                : await saveFacturaSuplidor(pendingData);
            reset(INITIAL_FORM);
            setIsrPct(0); setItbisPct(0);
            setDetalleForm(makeInitialDetalle(0, 0));
            setShowConfirm(false);
            showSnack("Factura guardada exitosamente", "success");
        } catch { showSnack("Error al guardar la factura", "error"); }
    };

    const showSnack = (msg: string, sev: "success" | "error") => { setSnackMsg(msg); setSnackSeverity(sev); setSnackOpen(true); };

    // ── Cálculos totales ──────────────────────────────────────────────────────
    const subtotalH          = watch("subtotal")           ?? 0;
    const itbisH             = watch("itbis")              ?? 0;
    const descuentoH         = watch("descuento")          ?? 0;
    const montoRetIsrH       = watch("montoRetencionIsr")  ?? 0;
    const montoRetItbisH     = watch("montoRetencionItbis") ?? 0;
    const totalFinal         = subtotalH + itbisH - descuentoH - montoRetIsrH - montoRetItbisH;

    const tablaSubtotal  = detalles.reduce((s,d) => s + (Number((d as any).subtotal)      ||0), 0);
    const tablaDescuento = detalles.reduce((s,d) => s + (Number((d as any).montoDescuento) ||0), 0);
    const tablaItbis     = detalles.reduce((s,d) => s + (Number((d as any).itbis)          ||0), 0);
    const tablaIsrRet    = detalles.reduce((s,d) => s + (Number((d as any).retencion)       ||0), 0);
    const tablaTotal     = detalles.reduce((s,d) => s + (Number((d as any).total)           ||0), 0);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Facturas Suplidor">
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="outlined" type="button" onClick={() => {
                        reset(INITIAL_FORM);
                        setIsrPct(0); setItbisPct(0);
                        setDetalleForm(makeInitialDetalle(0, 0));
                    }}>Nuevo</Button>
                </ActionBar>

                {/* ── Cargar Factura Existente + NCF ────────────────────────── */}
                <Box sx={{ px: 2.5, pt: 2, pb: 2, backgroundColor: "#fff" }}>
                    <Grid container spacing={3} alignItems="flex-end">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FieldLabel>Cargar Factura Existente</FieldLabel>
                            <Box display="flex" gap={1} alignItems="center">
                                <TextInputPk control={control} name="id" label="" error={errors.id} size={12} />
                                <SearchButton
                                    config={SEARCH_CONFIGS.FACTURA_SUPLIDOR}
                                    onOpenSearch={facturaSearch.openModal}
                                    variant="icon"
                                    tooltip="Buscar Factura Suplidor"
                                />
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <FieldLabel>NCF</FieldLabel>
                            <Box display="flex" alignItems="center">
                                <TextField
                                    fullWidth size="small" placeholder="Ej: E410000000007"
                                    {...register("ncf")}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px 0 0 4px",
                                        "&.Mui-focused fieldset": { borderColor: COLOR.accentTeal } } }}
                                />
                                <IconButton size="small" sx={{
                                    border: `1px solid ${COLOR.accentTeal}`, borderLeft: "none",
                                    borderRadius: "0 4px 4px 0", backgroundColor: `${COLOR.accentTeal}15`,
                                    color: COLOR.accentTeal, height: 40, width: 40,
                                    "&:hover": { backgroundColor: `${COLOR.accentTeal}30` },
                                }}>
                                    <GridOnIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* ── Datos de la Factura ───────────────────────────────────── */}
                <Box sx={{ backgroundColor: COLOR.sectionBg, px: 2.5, pt: 2, pb: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} align="center" mb={2}
                        sx={{ color: COLOR.navDark, letterSpacing: 0.3 }}>
                        Datos de la Factura
                    </Typography>

                    <Grid container spacing={2}>
                        {/* Fila 1 */}
                        <SuplidorComboBox control={control} name="suplidorId" label="Suplidor" error={errors.suplidorId} size={3} />

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Concepto" {...register("concepto")} />
                        </Grid>

                        {/* Retención ITBIS */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                select fullWidth size="small" label="Retención ITBIS"
                                value={watch("retencionItbisId") ?? ""}
                                onChange={(e) => handleRetencionChange("ITBIS", e.target.value)}
                            >
                                <MenuItem value="">— Ninguna —</MenuItem>
                                {retencionesItbis.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.descripcion} - {r.valor}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Retención ISR */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                select fullWidth size="small" label="Retención ISR"
                                value={watch("retencionIsrId") ?? ""}
                                onChange={(e) => handleRetencionChange("ISR", e.target.value)}
                            >
                                <MenuItem value="">— Ninguna —</MenuItem>
                                {retencionesIsr.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.descripcion} - {r.valor}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Tipo Retención */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField select fullWidth size="small" label="Tipo Retención" defaultValue="" {...register("tipoIngreso")}>
                                {TIPOS_RETENCION.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Fila 2 */}
                        <TipoComprobanteSelect control={control} name="tipoCfId" label="Tipo de Comprobante" size={2} />

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField select fullWidth size="small" label="Tipo de Pago" defaultValue="" {...register("tipoPago", { valueAsNumber: true })}>
                                <MenuItem value="">— Seleccione —</MenuItem>
                                {TIPOS_PAGO.map((t) => (<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="No. Factura" {...register("numeroFactura")} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField select fullWidth size="small" label="Estado" defaultValue="ACT" {...register("estadoId")}>
                                {ESTADOS.map((e) => (<MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField select fullWidth size="small" label="Es Crédito" defaultValue="" {...register("esCredito")}>
                                <MenuItem value="">—</MenuItem>
                                <MenuItem value="true">Sí</MenuItem>
                                <MenuItem value="false">No</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Fila 3: fechas */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Fecha Emisión" type="date" InputLabelProps={{ shrink: true }} {...register("fechaEmision")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Fecha Límite Pago" type="date" InputLabelProps={{ shrink: true }} {...register("fechaLimitePago")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Fecha Vencimiento" type="date" InputLabelProps={{ shrink: true }} {...register("fechaVencimiento")} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* ── ITEM Accordion ────────────────────────────────────────── */}
                <Box sx={{ px: 2.5, py: 2 }}>
                    <Accordion expanded={accordionOpen} onChange={() => setAccordionOpen(!accordionOpen)}
                        elevation={0}
                        sx={{ border: `1px solid ${COLOR.cardBorder}`, borderRadius: "6px !important", "&:before": { display: "none" } }}>
                        <AccordionSummary
                            sx={{ backgroundColor: COLOR.navDark, borderRadius: accordionOpen ? "6px 6px 0 0" : "6px",
                                minHeight: 44, "& .MuiAccordionSummary-content": { my: 0 } }}>
                            <Box display="flex" gap={2} alignItems="center">
                                <Typography fontWeight={700} sx={{ color: "#fff", letterSpacing: 1, fontSize: "0.8rem" }}>
                                    ITEM
                                </Typography>
                                {(isrPct > 0 || itbisPct > 0) && (
                                    <Box display="flex" gap={1}>
                                        {isrPct > 0 && (
                                            <Box sx={{ backgroundColor: "#e67e22", borderRadius: "4px", px: 1, py: 0.2 }}>
                                                <Typography sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>
                                                    ISR {isrPct}%
                                                </Typography>
                                            </Box>
                                        )}
                                        {itbisPct > 0 && (
                                            <Box sx={{ backgroundColor: "#16a085", borderRadius: "4px", px: 1, py: 0.2 }}>
                                                <Typography sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>
                                                    ITBIS Ret. {itbisPct}%
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 2, backgroundColor: "#fff" }}>
                            <Grid container spacing={1.5}>
                                {/* Fila A */}
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <FieldLabel>Concepto</FieldLabel>
                                    <TextField fullWidth size="small" placeholder="Digite un concepto"
                                        value={detalleForm.concepto ?? ""}
                                        onChange={(e) => handleDetalleField("concepto", e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Cuentas de Costo</FieldLabel>
                                    <TextField fullWidth size="small" placeholder="Seleccione cuenta" type="number"
                                        value={detalleForm.contableId ?? ""}
                                        onChange={(e) => handleDetalleField("contableId", parseInt(e.target.value)||undefined)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Centro de costos</FieldLabel>
                                    <TextField fullWidth size="small" placeholder="Seleccione centro" type="number"
                                        value={detalleForm.centroCostosId ?? ""}
                                        onChange={(e) => handleDetalleField("centroCostosId", parseInt(e.target.value)||undefined)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Bien o Servicio</FieldLabel>
                                    <TextField select fullWidth size="small"
                                        value={detalleForm.indicadorBienServicio ?? 1}
                                        onChange={(e) => handleDetalleField("indicadorBienServicio", Number(e.target.value))}>
                                        <MenuItem value={1}>Bien</MenuItem>
                                        <MenuItem value={2}>Servicio</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* Fila B */}
                                <Grid size={{ xs: 12, md: 1 }}>
                                    <FieldLabel>Cantidad</FieldLabel>
                                    <TextField fullWidth size="small" type="number"
                                        value={detalleForm.cantidad}
                                        onChange={(e) => handleDetalleField("cantidad", parseInt(e.target.value)||0)}
                                        inputProps={{ min: 1 }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Precio Item</FieldLabel>
                                    <TextField fullWidth size="small" type="number"
                                        value={detalleForm.precioUnitario}
                                        onChange={(e) => handleDetalleField("precioUnitario", parseFloat(e.target.value)||0)}
                                        inputProps={{ step: "0.0001" }}
                                        InputProps={{ startAdornment: <Typography variant="caption" color="text.secondary" mr={0.5}>RD$</Typography> }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Monto Item</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt4(detalleForm.montoItem)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ITBIS %</FieldLabel>
                                    <TextField select fullWidth size="small"
                                        value={detalleForm.itbisId || ""}
                                        onChange={(e) => {
                                            const sel = itbisOpciones.find((i) => i.id === Number(e.target.value));
                                            handleItbisSelect(sel?.id??0, sel?.itbis??0, sel?.nombre??"");
                                        }}>
                                        <MenuItem value="">Seleccione</MenuItem>
                                        {itbisOpciones.map((i) => (<MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ITBIS</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.itbis)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Descuento</FieldLabel>
                                    <TextField fullWidth size="small" type="number"
                                        value={detalleForm.montoDescuento ?? 0}
                                        onChange={(e) => handleDetalleField("montoDescuento", parseFloat(e.target.value)||0)}
                                        InputProps={{ startAdornment: <Typography variant="caption" color="text.secondary" mr={0.5}>RD$</Typography> }} />
                                </Grid>

                                {/* Fila C — calculados desde retenciones del header */}
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ISR Retenido {isrPct > 0 && <span style={{ color: "#e67e22" }}>({isrPct}%)</span>}</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.retencion)}`} disabled
                                        sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: isrPct > 0 ? "#e67e22" : undefined } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>SubTotal</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.subtotal)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ITBIS</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.itbis)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ITBIS Retenido {itbisPct > 0 && <span style={{ color: "#16a085" }}>({itbisPct}%)</span>}</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.montoItbisRetenido)}`} disabled
                                        sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: itbisPct > 0 ? "#16a085" : undefined } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Total</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.total)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>&nbsp;</FieldLabel>
                                    <Button fullWidth variant="contained" onClick={handleAddDetalle}
                                        sx={{ height: 40, backgroundColor: COLOR.navDark, "&:hover": { backgroundColor: "#1a252f" } }}>
                                        <AddIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Box>

                {/* ── Tabla ────────────────────────────────────────────────── */}
                <Box sx={{ px: 2.5, pb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" fontWeight={600} color={COLOR.labelGray}>
                            Detalle ({fields.length} {fields.length === 1 ? "item" : "items"})
                        </Typography>
                    </Box>

                    <TableContainer component={Paper} elevation={0}
                        sx={{ border: `1px solid ${COLOR.cardBorder}`, borderRadius: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: COLOR.tableHead }}>
                                    {["Concepto","Centro de costos","Cantidad","Precio Unitario",
                                      "SubTotal","Descuento","ITBIS","ISR Retenido","TOTAL","Acciones"].map((h) => (
                                        <TableCell key={h}
                                            align={["Concepto","Centro de costos","Acciones"].includes(h) ? "left" : "right"}
                                            sx={{ color:"#fff", fontWeight:700, fontSize:"0.75rem", py:1 }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fields.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center"
                                            sx={{ py: 3, color: COLOR.labelGray, fontStyle: "italic" }}>
                                            No hay items agregados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fields.map((f, idx) => {
                                        const d = detalles[idx] as any;
                                        return (
                                            <TableRow key={f.id} hover sx={{ "&:nth-of-type(even)": { backgroundColor: "#fafafa" } }}>
                                                <TableCell sx={{ fontSize:"0.82rem" }}>{d?.concepto||"—"}</TableCell>
                                                <TableCell sx={{ fontSize:"0.82rem" }}>{d?.centroCostosId||"—"}</TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem" }}>{d?.cantidad}</TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem" }}>RD$ {fmt(d?.precioUnitario)}</TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem" }}>RD$ {fmt(d?.subtotal)}</TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem" }}>RD$ {fmt(d?.montoDescuento)}</TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem" }}>RD$ {fmt(d?.itbis)}</TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem", color: isrPct > 0 ? "#e67e22" : "inherit" }}>
                                                    RD$ {fmt(d?.retencion)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize:"0.82rem", fontWeight:600 }}>RD$ {fmt(d?.total)}</TableCell>
                                                <TableCell>
                                                    <IconButton color="error" size="small" onClick={() => handleRemoveDetalle(idx)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                                {/* Totales */}
                                <TableRow sx={{ backgroundColor: COLOR.totalsRow }}>
                                    <TableCell colSpan={4} sx={{ fontWeight:700, fontSize:"0.82rem" }}>Totales</TableCell>
                                    <TableCell align="right" sx={{ fontWeight:700, fontSize:"0.82rem" }}>RD$ {fmt(tablaSubtotal)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight:700, fontSize:"0.82rem" }}>RD$ {fmt(tablaDescuento)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight:700, fontSize:"0.82rem" }}>RD$ {fmt(tablaItbis)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight:700, fontSize:"0.82rem", color: isrPct > 0 ? "#e67e22" : "inherit" }}>
                                        RD$ {fmt(tablaIsrRet)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight:700, fontSize:"0.82rem" }}>RD$ {fmt(tablaTotal)}</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* ── Resumen final ────────────────────────────────────────── */}
                <Grid container spacing={2} sx={{ px: 2.5, pb: 3 }}>
                    <Grid size={{ xs: 12, md: 8 }} />
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ border: `1px solid ${COLOR.cardBorder}`, borderRadius: 1, overflow: "hidden" }}>
                            <Box sx={{ backgroundColor: COLOR.navDark, px: 2, py: 0.75 }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color:"#fff", letterSpacing:0.5 }}>RESUMEN</Typography>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: "#fff" }}>
                                {/* Subtotal e ITBIS — calculados */}
                                {[
                                    { label:"Subtotal", value: subtotalH, color:"text.primary" },
                                    { label:"ITBIS",    value: itbisH,    color:"text.primary" },
                                ].map(({ label, value, color }) => (
                                    <Box key={label} display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
                                        <Typography variant="body2" color={COLOR.labelGray}>{label}</Typography>
                                        <Typography variant="body2" color={color}>RD$ {fmt(value)}</Typography>
                                    </Box>
                                ))}

                                {/* Descuento — editable */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
                                    <Typography variant="body2" color={COLOR.labelGray} sx={{ minWidth: 90 }}>Descuento</Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        {...register("descuento", { valueAsNumber: true })}
                                        inputProps={{ step: "0.01", min: 0 }}
                                        sx={{ width: 150, "& .MuiInputBase-input": { textAlign: "right", py: 0.5, fontSize: "0.875rem" } }}
                                        InputProps={{ startAdornment: <Typography variant="caption" color="text.secondary" mr={0.5}>RD$</Typography> }}
                                    />
                                </Box>

                                {/* Ret. ISR — calculado automáticamente */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
                                    <Typography variant="body2" color={COLOR.labelGray}>
                                        Ret. ISR {isrPct > 0 && <span style={{ color:"#e67e22", fontSize:"0.75rem" }}>({isrPct}%)</span>}
                                    </Typography>
                                    <Typography variant="body2" color="error.main">RD$ {fmt(montoRetIsrH)}</Typography>
                                </Box>

                                {/* Ret. ITBIS — calculado automáticamente */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
                                    <Typography variant="body2" color={COLOR.labelGray}>
                                        Ret. ITBIS {itbisPct > 0 && <span style={{ color:"#16a085", fontSize:"0.75rem" }}>({itbisPct}%)</span>}
                                    </Typography>
                                    <Typography variant="body2" color="error.main">RD$ {fmt(montoRetItbisH)}</Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography fontWeight={700} color={COLOR.navDark}>Total</Typography>
                                    <Typography fontWeight={700} fontSize="1.1rem" color={COLOR.navDark}>
                                        RD$ {fmt(totalFinal)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </form>

            {/* ── Advertencia cambio de retención ──────────────────────────── */}
            <Dialog open={!!pendingRet} onClose={handleCancelRetencionChange} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display:"flex", alignItems:"center", gap:1.5, backgroundColor:"#fff3cd", color:"#856404" }}>
                    <WarningAmberIcon sx={{ color:"#e67e22" }} />
                    Cambio de Retención
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body1" mb={1}>
                        Está cambiando la <strong>Retención {pendingRet?.tipo}</strong> a{" "}
                        <strong>{pendingRet?.descripcion || "Ninguna"}</strong>.
                    </Typography>
                    <Typography variant="body2" color="error">
                        Ya existen <strong>{fields.length} ítem(s)</strong> en la tabla. Al confirmar este cambio,
                        todos los renglones serán eliminados y deberá ingresarlos nuevamente con la nueva retención aplicada.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCancelRetencionChange}>
                        Cancelar — Mantener retención actual
                    </Button>
                    <Button variant="contained" color="error" onClick={handleConfirmRetencionChange}>
                        Confirmar — Limpiar y cambiar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Confirmar guardado ───────────────────────────────────────── */}
            <ConfirmationModal
                open={showConfirm}
                title="Confirmar guardado"
                message="¿Está seguro que desea guardar esta factura suplidor?"
                onConfirm={handleConfirmSave}
                onCancel={() => setShowConfirm(false)}
            />

            {facturaSearch.config && (
                <ModalSearch
                    open={facturaSearch.isOpen}
                    onClose={facturaSearch.closeModal}
                    onSelect={handleFacturaSelect}
                    config={facturaSearch.config}
                />
            )}

            <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)}>
                <Alert severity={snackSeverity}>{snackMsg}</Alert>
            </Snackbar>
        </>
    );
};

export default FacturaSuplidorView;
