import React, { useState, useEffect, useCallback } from "react";
import {
    Alert,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
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
    MfFacturaSuplidorDetalleDescuentoRequest,
} from "../../models/facturacion/MfFacturaSuplidor";
import {
    validateFacturaSuplidor,
    suplidorRuleForTipoCf,
    FacturaSuplidorErrors,
} from "../../validations/facturaSuplidorValidation";

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

// ── Fecha en zona horaria República Dominicana (UTC-4, sin DST) ───────────────
function getDRToday(): string {
    const now    = new Date();
    const utcMs  = now.getTime() + now.getTimezoneOffset() * 60_000;
    const drDate = new Date(utcMs - 4 * 60 * 60_000); // UTC-4
    return drDate.toISOString().slice(0, 10);          // YYYY-MM-DD
}

// ── Tipos auxiliares ──────────────────────────────────────────────────────────
interface PendingRetencionChange {
    tipo:        "ISR" | "ITBIS";
    id:          number | undefined;
    valor:       number;
    descripcion: string;
}

// ── Estado inicial ────────────────────────────────────────────────────────────
function makeInitialForm(): MfFacturaSuplidorRequest {
    const hoy = getDRToday();
    return {
        estadoId:            "ACT",
        descuento:           0,
        itbis:               0,
        subTotal:            0,
        total:               0,
        montoAnulado:        0,
        montoRetencionIsr:   0,
        montoRetencionItbis: 0,
        fechaEmision:        hoy,  // hoy en RD
        fechaVencimiento:    hoy,  // igual a emisión por ahora; backend ajustará
        detalles:            [],
    };
}
const INITIAL_FORM = makeInitialForm();

interface DetalleLocal extends MfFacturaSuplidorDetalleRequest {
    itbisNombre?: string;
    descuentos: MfFacturaSuplidorDetalleDescuentoRequest[];
}

// Estado local del dialog de descuentos
interface DescuentoFormLocal {
    tipo: '$' | '%';
    valor: string; // string para el input controlado
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
    subTotal:               0,
    total:                  0,
    indicadorBienServicio:  undefined, // usuario debe elegir explícitamente
    montoDescuento:         0,
    descuentos:             [],
});

const ESTADOS = [{ value:"ACT",label:"Activo"},{ value:"PEN",label:"Pendiente"},{ value:"PAG",label:"Pagada"},{ value:"ANU",label:"Anulada"}];

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
    const [yupErrors, setYupErrors]         = useState<FacturaSuplidorErrors>({});
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

    // Dialog de descuentos del renglón
    const [descDialogOpen, setDescDialogOpen]   = useState(false);
    const [descForm, setDescForm]               = useState<DescuentoFormLocal>({ tipo: '$', valor: "" });

    useEffect(() => {
        getItbisActivos().then(setItbisOpciones).catch(() => {});
        getRetencionesPorTipo("ITBIS").then(setRetencionesItbis).catch(() => {});
        getRetencionesPorTipo("ISR").then(setRetencionesIsr).catch(() => {});
    }, []);

    const facturaSearch = useModalSearch();

    const { control, handleSubmit, reset, setValue, watch, register, formState: { errors } } =
        useForm<MfFacturaSuplidorRequest>({ defaultValues: INITIAL_FORM });

    const { fields, append, remove } = useFieldArray({ control, name: "detalles" });
    const detalles      = watch("detalles");
    const tipoCfIdVal   = watch("tipoCfId");
    const suplidorIdVal = watch("suplidorId");
    const suplidorRule  = suplidorRuleForTipoCf(tipoCfIdVal);

    // Limpiar error Yup de suplidor en cuanto el usuario selecciona uno
    useEffect(() => {
        if (suplidorIdVal) {
            setYupErrors((prev) => { const n = { ...prev }; delete n.suplidorId; return n; });
        }
    }, [suplidorIdVal]);

    // CF 43 y 47: solo Exento (filtrado por nombre, no por valor 0 para no capturar "No Facturable")
    const soloExento       = tipoCfIdVal === "43" || tipoCfIdVal === "47";
    const itbisDisponibles = soloExento
        ? itbisOpciones.filter((i) => i.nombre?.toLowerCase().includes("exento"))
        : itbisOpciones;
    // Valor del select ITBIS: cuando soloExento, forzar al primer exento disponible
    const itbisSelectValue = soloExento
        ? (itbisDisponibles[0]?.id ?? "")
        : (detalleForm.itbisId || "");

    // Reacciona al cambio de tipo de comprobante
    useEffect(() => {
        if (!tipoCfIdVal) return;

        // CF 43 = Gastos Menores: suplidor no aplica
        if (tipoCfIdVal === "43") {
            setValue("suplidorId", undefined);
        }

        // CF 43 y 47: solo puede usarse ITBIS Exento (buscado por nombre)
        if (tipoCfIdVal === "43" || tipoCfIdVal === "47") {
            const exento = itbisOpciones.find((i) => i.nombre?.toLowerCase().includes("exento"));
            if (exento) {
                handleItbisSelect(exento.id ?? 0, exento.itbis ?? 0, exento.nombre);
            }
        } else {
            // Al cambiar a otro CF, resetear ITBIS del detalle
            setDetalleForm((prev) => recalcDetalle({ ...prev, itbisId: 0, itbisPorciento: 0, itbisNombre: "" }));
        }

        // Limpiar error Yup de suplidor al cambiar CF
        setYupErrors((prev) => { const n = { ...prev }; delete n.suplidorId; return n; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoCfIdVal, itbisOpciones]);

    // ── Recalc detalle ────────────────────────────────────────────────────────
    // ISR sólo aplica a Servicios (indicadorBienServicio === 2). Los bienes no llevan retención ISR.
    const recalcDetalle = useCallback((d: DetalleLocal, newIsrPct?: number, newItbisPct?: number): DetalleLocal => {
        const usedIsrPct   = newIsrPct   ?? d.retencionIsrPorciento   ?? isrPct;
        const usedItbisPct = newItbisPct ?? d.retencionItbisPorciento ?? itbisPct;

        const esServicio         = d.indicadorBienServicio === 2;
        const montoItem          = (d.cantidad || 0) * (d.precioUnitario || 0);
        const itbisAmt           = montoItem * ((d.itbisPorciento || 0) / 100);
        const subTotal           = montoItem - (d.montoDescuento || 0) + (d.montoRecargo || 0);
        const retencion          = esServicio ? subTotal * (usedIsrPct   / 100) : 0; // bienes: sin ISR
        const montoItbisRetenido = itbisAmt  * (usedItbisPct / 100);
        const total              = subTotal  + itbisAmt;

        return {
            ...d,
            montoItem,
            itbis: itbisAmt,
            subTotal,
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
            subTotal:            completa.subTotal,
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

    // ── Helpers dialog de descuentos ─────────────────────────────────────────
    const calcDescuentoMonto = (tipo: '$' | '%', valor: number, montoItem: number): number => {
        if (tipo === '$') return valor;
        return (montoItem * valor) / 100;
    };

    const handleDescAgregar = () => {
        const val = parseFloat(descForm.valor) || 0;
        if (val <= 0) { showSnack("Ingrese un valor mayor a 0", "error"); return; }
        const monto = calcDescuentoMonto(descForm.tipo, val, detalleForm.montoItem ?? 0);
        const nuevaLista: MfFacturaSuplidorDetalleDescuentoRequest[] = [
            ...(detalleForm.descuentos ?? []),
            { tipo: descForm.tipo, valor: val, monto },
        ];
        const totalDesc = nuevaLista.reduce((s, d) => s + d.monto, 0);
        setDetalleForm((prev) => recalcDetalle({ ...prev, descuentos: nuevaLista, montoDescuento: totalDesc }));
        setDescForm({ tipo: '$', valor: "" });
    };

    const handleDescEliminar = (idx: number) => {
        const nuevaLista = (detalleForm.descuentos ?? []).filter((_, i) => i !== idx);
        const totalDesc  = nuevaLista.reduce((s, d) => s + d.monto, 0);
        setDetalleForm((prev) => recalcDetalle({ ...prev, descuentos: nuevaLista, montoDescuento: totalDesc }));
    };

    const handleDescGuardar = () => setDescDialogOpen(false);

    const handleAddDetalle = () => {
        if (!detalleForm.indicadorBienServicio) { showSnack("Seleccione si el renglón es Bien o Servicio", "error"); return; }
        if (!detalleForm.concepto?.trim())       { showSnack("El concepto del renglón es requerido", "error"); return; }
        if (!detalleForm.itbisId)                { showSnack("Seleccione el ITBIS del renglón", "error"); return; }
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
        let subTotal = 0, itbis = 0, total = 0, isrRet = 0, itbisRet = 0;
        rows.forEach((r) => {
            subTotal  += Number(r.subTotal)           || 0;
            itbis     += Number(r.itbis)              || 0;
            total     += Number(r.total)              || 0;
            isrRet    += Number(r.retencion)          || 0;
            itbisRet  += Number(r.montoItbisRetenido) || 0;
        });
        setValue("subTotal",            subTotal);
        setValue("itbis",               itbis);
        setValue("total",               total);
        setValue("montoRetencionIsr",   isrRet);
        setValue("montoRetencionItbis", itbisRet);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit: SubmitHandler<MfFacturaSuplidorRequest> = async (data) => {
        const { isValid, errors } = await validateFacturaSuplidor(data);
        if (!isValid) {
            setYupErrors(errors);
            const first = Object.values(errors)[0];
            showSnack(first, "error");
            return;
        }
        setYupErrors({});
        setPendingData(data);
        setShowConfirm(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;
        try {
            pendingData.id
                ? await updateFacturaSuplidor(pendingData.id, pendingData)
                : await saveFacturaSuplidor(pendingData);
            reset(makeInitialForm());
            setIsrPct(0); setItbisPct(0);
            setDetalleForm(makeInitialDetalle(0, 0));
            setShowConfirm(false);
            showSnack("Factura guardada exitosamente", "success");
        } catch { showSnack("Error al guardar la factura", "error"); }
    };

    const showSnack = (msg: string, sev: "success" | "error") => { setSnackMsg(msg); setSnackSeverity(sev); setSnackOpen(true); };

    // ── Cálculos totales ──────────────────────────────────────────────────────
    const esCreditoVal       = watch("esCredito");
    const esCredito2         = String(esCreditoVal) === "2"; // solo Crédito muestra fecha límite

    const subtotalH          = watch("subTotal")            ?? 0;
    const itbisH             = watch("itbis")              ?? 0;
    const descuentoH         = watch("descuento")          ?? 0;
    const montoRetIsrH       = watch("montoRetencionIsr")  ?? 0;
    const montoRetItbisH     = watch("montoRetencionItbis") ?? 0;
    const totalFinal         = subtotalH + itbisH - descuentoH - montoRetIsrH - montoRetItbisH;

    const tablaSubtotal  = detalles.reduce((s,d) => s + (Number((d as any).subTotal)      ||0), 0);
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
                        reset(makeInitialForm());
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
                        {/* Fila 1 — Suplidor: siempre visible, deshabilitado para CF 43 */}
                        <SuplidorComboBox
                            control={control}
                            name="suplidorId"
                            label={
                                suplidorRule.required
                                    ? "Suplidor *"
                                    : suplidorRule.hint
                                        ? `Suplidor (${suplidorRule.hint})`
                                        : "Suplidor"
                            }
                            error={errors.suplidorId ?? (yupErrors.suplidorId ? { message: yupErrors.suplidorId } as any : undefined)}
                            size={3}
                            disabled={suplidorRule.disabled}
                        />

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

                        {/* Fila 2 */}
                        <TipoComprobanteSelect control={control} name="tipoCfId" label="Tipo de Comprobante" size={2} />

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="No. Factura" {...register("numeroFactura")} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField select fullWidth size="small" label="Estado" defaultValue="ACT" {...register("estadoId")}>
                                {ESTADOS.map((e) => (<MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                select fullWidth size="small" label="Tipo de Crédito"
                                value={esCreditoVal ?? ""}
                                onChange={(e) => {
                                    setValue("esCredito", e.target.value as any);
                                    if (e.target.value !== "2") {
                                        setValue("fechaLimitePago", undefined);
                                    }
                                }}
                            >
                                <MenuItem value="">— Seleccione —</MenuItem>
                                <MenuItem value="1">Contado</MenuItem>
                                <MenuItem value="2">Crédito</MenuItem>
                                <MenuItem value="3">Gratuito</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Fila 3: fecha límite pago (solo crédito) + descuento */}
                        {esCredito2 && (
                            <Grid size={{ xs: 12, md: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Fecha Límite Pago *"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.fechaLimitePago}
                                    helperText={errors.fechaLimitePago?.message as string}
                                    {...register("fechaLimitePago", {
                                        validate: (v) =>
                                            esCredito2 && !v
                                                ? "La fecha límite de pago es requerida para crédito"
                                                : true,
                                    })}
                                />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Descuento" type="number"
                                inputProps={{ step: "0.01", min: 0 }}
                                {...register("descuento", { valueAsNumber: true })} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* ── ITEM Accordion ────────────────────────────────────────── */}
                <Box sx={{ px: 2.5, py: 2 }}>
                    <Accordion
                        expanded={!!tipoCfIdVal && accordionOpen}
                        onChange={() => { if (tipoCfIdVal) setAccordionOpen(!accordionOpen); }}
                        elevation={0}
                        sx={{ border: `1px solid ${COLOR.cardBorder}`, borderRadius: "6px !important", "&:before": { display: "none" },
                            opacity: tipoCfIdVal ? 1 : 0.55, pointerEvents: tipoCfIdVal ? "auto" : "none" }}>
                        <AccordionSummary
                            sx={{ backgroundColor: tipoCfIdVal ? COLOR.navDark : "#95a5a6",
                                borderRadius: (!!tipoCfIdVal && accordionOpen) ? "6px 6px 0 0" : "6px",
                                minHeight: 44, "& .MuiAccordionSummary-content": { my: 0 }, cursor: tipoCfIdVal ? "pointer" : "not-allowed" }}>
                            <Box display="flex" gap={2} alignItems="center">
                                <Typography fontWeight={700} sx={{ color: "#fff", letterSpacing: 1, fontSize: "0.8rem" }}>
                                    ITEM
                                </Typography>
                                {!tipoCfIdVal && (
                                    <Typography sx={{ color: "#ffffffb0", fontSize: "0.72rem", fontStyle: "italic" }}>
                                        — Seleccione el Tipo de Comprobante primero
                                    </Typography>
                                )}
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
                                {/* Fila A — Bien/Servicio primero; el resto depende de él */}
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Bien o Servicio *</FieldLabel>
                                    <TextField select fullWidth size="small"
                                        value={detalleForm.indicadorBienServicio ?? ""}
                                        onChange={(e) => handleDetalleField("indicadorBienServicio", Number(e.target.value) || undefined)}>
                                        <MenuItem value="">— Seleccione —</MenuItem>
                                        <MenuItem value={1}>Bien</MenuItem>
                                        <MenuItem value={2}>Servicio</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>Concepto</FieldLabel>
                                    <TextField fullWidth size="small" placeholder="Digite un concepto"
                                        disabled={!detalleForm.indicadorBienServicio}
                                        value={detalleForm.concepto ?? ""}
                                        onChange={(e) => handleDetalleField("concepto", e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Cuentas de Costo</FieldLabel>
                                    <TextField fullWidth size="small" placeholder="Seleccione cuenta" type="number"
                                        disabled={!detalleForm.indicadorBienServicio}
                                        value={detalleForm.contableId ?? ""}
                                        onChange={(e) => handleDetalleField("contableId", parseInt(e.target.value)||undefined)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Centro de costos</FieldLabel>
                                    <TextField fullWidth size="small" placeholder="Seleccione centro" type="number"
                                        disabled={!detalleForm.indicadorBienServicio}
                                        value={detalleForm.centroCostosId ?? ""}
                                        onChange={(e) => handleDetalleField("centroCostosId", parseInt(e.target.value)||undefined)} />
                                </Grid>

                                {/* Fila B — Precio Item → Monto Item → Cantidad → ITBIS → Descuento */}
                                <Grid size={{ xs: 12, md: 1 }}>
                                    <FieldLabel>Cantidad</FieldLabel>
                                    <TextField fullWidth size="small" type="number"
                                        disabled={!detalleForm.indicadorBienServicio}
                                        value={detalleForm.cantidad}
                                        onChange={(e) => handleDetalleField("cantidad", parseInt(e.target.value)||0)}
                                        inputProps={{ min: 1 }} />
                                </Grid>
                                
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Precio Item</FieldLabel>
                                    <TextField fullWidth size="small" type="number"
                                        disabled={!detalleForm.indicadorBienServicio}
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
                                    <FieldLabel>
                                        ITBIS %{" "}
                                        {soloExento && (
                                            <span style={{ color: "#17a589", fontSize: "0.7rem" }}>(solo Exento)</span>
                                        )}
                                    </FieldLabel>
                                    <TextField select fullWidth size="small"
                                        value={itbisSelectValue}
                                        disabled={soloExento || !(detalleForm.montoItem && detalleForm.montoItem > 0)}
                                        onChange={(e) => {
                                            const sel = itbisDisponibles.find((i) => i.id === Number(e.target.value));
                                            handleItbisSelect(sel?.id??0, sel?.itbis??0, sel?.nombre??"");
                                        }}>
                                        <MenuItem value="">Seleccione</MenuItem>
                                        {itbisDisponibles.map((i) => (<MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ITBIS RD$</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.itbis)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Descuentos</FieldLabel>
                                    <Button
                                        fullWidth variant="outlined" size="small"
                                        disabled={!detalleForm.indicadorBienServicio || !(detalleForm.montoItem && detalleForm.montoItem > 0)}
                                        onClick={() => setDescDialogOpen(true)}
                                        sx={{ height: 40, borderColor: COLOR.accentTeal, color: COLOR.accentTeal,
                                            "&:hover": { borderColor: COLOR.accentTeal, backgroundColor: `${COLOR.accentTeal}10` },
                                            "&.Mui-disabled": { borderColor: "#ccc", color: "#ccc" } }}
                                        endIcon={
                                            (detalleForm.descuentos?.length ?? 0) > 0
                                                ? <Chip label={detalleForm.descuentos!.length} size="small"
                                                    sx={{ height: 18, fontSize: "0.65rem",
                                                          backgroundColor: COLOR.accentTeal, color: "#fff" }} />
                                                : null
                                        }
                                    >
                                        {(detalleForm.montoDescuento ?? 0) > 0
                                            ? `RD$ ${fmt(detalleForm.montoDescuento)}`
                                            : "Agregar"}
                                    </Button>
                                </Grid>

                                {/* Fila C — calculados */}
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>ITBIS Retenido {itbisPct > 0 && <span style={{ color: "#16a085" }}>({itbisPct}%)</span>}</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.montoItbisRetenido)}`} disabled
                                        sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: itbisPct > 0 ? "#16a085" : undefined } }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>
                                        ISR Retenido{" "}
                                        {detalleForm.indicadorBienServicio === 1
                                            ? <span style={{ color: "#aaa", fontSize: "0.68rem" }}>(no aplica a bienes)</span>
                                            : isrPct > 0 && <span style={{ color: "#e67e22" }}>({isrPct}%)</span>
                                        }
                                    </FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.retencion)}`} disabled
                                        sx={{ "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: detalleForm.indicadorBienServicio === 1
                                                ? "#bbb"
                                                : isrPct > 0 ? "#e67e22" : undefined
                                        }}} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>Total</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.total)}`} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <FieldLabel>SubTotal</FieldLabel>
                                    <TextField fullWidth size="small" value={`RD$ ${fmt(detalleForm.subTotal)}`} disabled />
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
                                                <TableCell align="right" sx={{ fontSize:"0.82rem" }}>RD$ {fmt(d?.subTotal)}</TableCell>
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

                                {/* Descuento */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
                                    <Typography variant="body2" color={COLOR.labelGray}>Descuento</Typography>
                                    <Typography variant="body2" color="error.main">RD$ {fmt(descuentoH)}</Typography>
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

            {/* ── Dialog de Descuentos del renglón ─────────────────────────── */}
            <Dialog open={descDialogOpen} onClose={() => setDescDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: "#3f51b5", color: "#fff", fontWeight: 700 }}>
                    ✂ Agregar Descuentos
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {/* Resumen del renglón */}
                    <Box sx={{ backgroundColor: "#f0f4ff", borderRadius: 1, p: 1.5, mb: 2, textAlign: "center" }}>
                        <Typography variant="body2" fontWeight={600} color="#3f51b5">
                            📋 Total del detalle:{" "}
                            <strong>RD$ {fmt(detalleForm.montoItem)}</strong>
                        </Typography>
                        <Typography variant="body2" color="#3f51b5">
                            🏷 Total disponible para descuentos:{" "}
                            <strong>
                                RD$ {fmt((detalleForm.montoItem ?? 0) - (detalleForm.montoDescuento ?? 0))}
                            </strong>
                        </Typography>
                    </Box>

                    {/* Formulario agregar descuento */}
                    <Box display="flex" gap={1.5} alignItems="flex-end" mb={2}>
                        <Box sx={{ minWidth: 130 }}>
                            <FieldLabel>Tipo de Descuento</FieldLabel>
                            <TextField select fullWidth size="small"
                                value={descForm.tipo}
                                onChange={(e) => setDescForm((p) => ({ ...p, tipo: e.target.value as '$' | '%', valor: "" }))}>
                                <MenuItem value="$">$ (Monto fijo)</MenuItem>
                                <MenuItem value="%">% (Porcentaje)</MenuItem>
                            </TextField>
                        </Box>

                        {descForm.tipo === '%' ? (
                            <>
                                <Box flex={1}>
                                    <FieldLabel>Porcentaje</FieldLabel>
                                    <TextField fullWidth size="small" type="number"
                                        value={descForm.valor}
                                        onChange={(e) => setDescForm((p) => ({ ...p, valor: e.target.value }))}
                                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                    />
                                </Box>
                                <Box flex={1}>
                                    <FieldLabel>Monto Calculado</FieldLabel>
                                    <TextField fullWidth size="small" disabled
                                        value={`RD$ ${fmt(calcDescuentoMonto('%', parseFloat(descForm.valor) || 0, detalleForm.montoItem ?? 0))}`}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Box flex={1}>
                                <FieldLabel>Monto</FieldLabel>
                                <TextField fullWidth size="small" type="number"
                                    value={descForm.valor}
                                    onChange={(e) => setDescForm((p) => ({ ...p, valor: e.target.value }))}
                                    inputProps={{ min: 0, step: "0.01" }}
                                    InputProps={{ startAdornment: <InputAdornment position="start">RD$</InputAdornment> }}
                                />
                            </Box>
                        )}

                        <Button variant="contained" size="small" onClick={handleDescAgregar}
                            sx={{ height: 40, backgroundColor: "#3f51b5", "&:hover": { backgroundColor: "#303f9f" },
                                minWidth: 90, whiteSpace: "nowrap" }}>
                            + Agregar
                        </Button>
                    </Box>

                    {/* Tabla de descuentos */}
                    <TableContainer component={Paper} elevation={0}
                        sx={{ border: `1px solid ${COLOR.cardBorder}`, borderRadius: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#3f51b5" }}>
                                    {["Tipo", "Porcentaje / Valor", "Monto", "Acciones"].map((h) => (
                                        <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.75rem", py: 1 }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(detalleForm.descuentos ?? []).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center"
                                            sx={{ py: 2.5, color: COLOR.labelGray, fontStyle: "italic", fontSize: "0.82rem" }}>
                                            ℹ No hay descuentos agregados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (detalleForm.descuentos ?? []).map((d, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                                                {d.tipo === '%' ? '%' : '$'}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "0.82rem" }}>
                                                {d.tipo === '%' ? `${fmt(d.valor)}%` : `RD$ ${fmt(d.valor)}`}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "0.82rem" }}>RD$ {fmt(d.monto)}</TableCell>
                                            <TableCell>
                                                <IconButton color="error" size="small" onClick={() => handleDescEliminar(idx)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Fila total */}
                                <TableRow sx={{ backgroundColor: COLOR.totalsRow }}>
                                    <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                                        📋 Total Descuentos:
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                                        RD$ {fmt(detalleForm.montoDescuento ?? 0)}
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setDescDialogOpen(false)}>
                        ✕ Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleDescGuardar}
                        sx={{ backgroundColor: "#3f51b5", "&:hover": { backgroundColor: "#303f9f" } }}>
                        💾 Guardar Descuentos
                    </Button>
                </DialogActions>
            </Dialog>

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
