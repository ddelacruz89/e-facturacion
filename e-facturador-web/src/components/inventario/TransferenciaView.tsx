import React, { useState, useCallback } from "react";
import {
    Button,
    Snackbar,
    Alert,
    IconButton,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import ActionBar from "../../customers/ActionBar";
import { NumericInput, AlphanumericInput } from "../../customers/CustomMUIComponents";
import { AlmacenComboBox } from "../../customers/ProductComboBoxes";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { InTransferencia, InTransferenciaRequestDTO } from "../../models/inventario/transferencia";
import {
    createTransferencia,
    updateTransferencia,
    getTransferencias,
    anularTransferencia,
    getLotesConStockEnAlmacen,
    InProductoLotesStock,
} from "../../apis/TransferenciaController";

// ── SIN_LOTE sentinel ────────────────────────────────────────────────────────
// El backend devuelve lote=null cuando el stock no tiene lote asignado.
// En el Select de MUI usamos "" para representar ese caso.
const SIN_LOTE = "";

// ── tipos internos ────────────────────────────────────────────────────────────

interface DetalleForm {
    productoId: any;
    cant: number;
    lote: string;            // "" = sin lote
    cantidadUnidad?: number;
    unidadDescripcion?: string;
}

interface TransferenciaForm {
    id?: number;
    origenAlmacenId: any;
    destinoAlmacenId: any;
    estadoId: string;
    detalles: DetalleForm[];
}

const initialForm: TransferenciaForm = {
    origenAlmacenId: undefined,
    destinoAlmacenId: undefined,
    estadoId: "PEN",
    detalles: [],
};

const estadoColor: Record<string, "default" | "warning" | "success" | "error"> = {
    PEN: "warning", APR: "success", INA: "error",
};
const estadoLabel: Record<string, string> = {
    PEN: "Pendiente", APR: "Aprobada", INA: "Anulada",
};

// ── helpers ───────────────────────────────────────────────────────────────────

const nombreProducto = (p: any) => {
    if (!p) return "";
    if (typeof p === "object") return p.nombreProducto ?? p.nombre ?? `ID: ${p.id}`;
    return `ID: ${p}`;
};
const nombreAlmacen = (a: any) => {
    if (!a) return "—";
    if (typeof a === "object") return a.nombre ?? `ID: ${a.id}`;
    return `ID: ${a}`;
};
const getAlmacenId = (raw: any): number | undefined => {
    if (!raw) return undefined;
    if (typeof raw === "object") return raw?.id ?? raw?.value;
    return raw;
};
const getProductoId = (raw: any): number | undefined => {
    if (!raw) return undefined;
    if (typeof raw === "object") return raw?.id;
    return raw;
};

// ── componente ────────────────────────────────────────────────────────────────

export const TransferenciaView: React.FC = () => {
    const [transferencias, setTransferencias] = useState<InTransferencia[]>([]);
    const [listLoaded, setListLoaded] = useState(false);
    const [showList, setShowList] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [partialWarnings, setPartialWarnings] = useState<{ nombre: string; solicitado: number; transferido: number }[]>([]);
    const [activeDetalleIndex, setActiveDetalleIndex] = useState<number | null>(null);

    // Por índice de fila: stock desglosado por lote
    const [lotesMap, setLotesMap] = useState<Record<number, InProductoLotesStock>>({});
    // Loading por fila
    const [loadingLotes, setLoadingLotes] = useState<Record<number, boolean>>({});

    const [snackbar, setSnackbar] = useState<{
        open: boolean; message: string; severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "info" });

    const productoSearch = useModalSearch();

    const { control, handleSubmit, watch, setValue, reset } = useForm<TransferenciaForm>({
        defaultValues: initialForm,
    });
    const { fields, append, remove } = useFieldArray({ control, name: "detalles" });

    const showMsg = (message: string, severity: "success" | "error" | "warning" | "info") =>
        setSnackbar({ open: true, message, severity });

    // ── lista ─────────────────────────────────────────────────────────────────

    const loadList = useCallback(async () => {
        try {
            const data = await getTransferencias();
            setTransferencias(data);
            setListLoaded(true);
            setShowList(true);
        } catch {
            showMsg("Error al cargar transferencias", "error");
        }
    }, []);

    const loadIntoForm = (t: InTransferencia) => {
        reset({
            id: t.id,
            origenAlmacenId: t.origenAlmacenId,
            destinoAlmacenId: t.destinoAlmacenId,
            estadoId: t.estadoId ?? "PEN",
            detalles: (t.detalles ?? []).map((d) => ({
                productoId: d.productoId,
                cant: d.cant,
                lote: d.lote ?? SIN_LOTE,
                cantidadUnidad: d.cantidadUnidad,
                unidadDescripcion: d.unidadDescripcion ?? "",
            })),
        });
        setLotesMap({});
        setShowList(false);
    };

    // ── carga de lotes para una fila ──────────────────────────────────────────

    const cargarLotes = async (index: number, productoId: number, almacenId: number) => {
        setLoadingLotes((prev) => ({ ...prev, [index]: true }));
        try {
            const result = await getLotesConStockEnAlmacen(productoId, almacenId);
            setLotesMap((prev) => ({ ...prev, [index]: result }));
            // Seleccionar el primer lote disponible automáticamente
            if (result.lotes.length > 0) {
                const primerLote = result.lotes[0].lote ?? SIN_LOTE;
                setValue(`detalles.${index}.lote`, primerLote);
            }
            // Auto-poblar unidad desde info del producto
            if (result.unidadNombre) {
                setValue(`detalles.${index}.cantidadUnidad`, result.cantidadUnidad ?? 1);
                const desc = result.esFraccionario
                    ? `${result.unidadNombre} x${result.cantidadUnidad} ${result.unidadFraccionSigla ?? ""}`.trim()
                    : (result.unidadNombre ?? "");
                setValue(`detalles.${index}.unidadDescripcion`, desc);
            }
        } catch {
            // silencioso
        } finally {
            setLoadingLotes((prev) => ({ ...prev, [index]: false }));
        }
    };

    // ── búsqueda de producto ──────────────────────────────────────────────────

    const handleOpenProductSearch = (index: number) => {
        setActiveDetalleIndex(index);
        productoSearch.openModal(SEARCH_CONFIGS.PRODUCTO);
    };

    const handleProductoSelect = productoSearch.handleSelect(async (producto: any) => {
        if (activeDetalleIndex === null) return;
        setValue(`detalles.${activeDetalleIndex}.productoId`, producto);
        setValue(`detalles.${activeDetalleIndex}.lote`, SIN_LOTE);

        const origenId = getAlmacenId(watch("origenAlmacenId"));
        const productoId = getProductoId(producto);

        if (origenId && productoId) {
            await cargarLotes(activeDetalleIndex, productoId, origenId);
        }
        setActiveDetalleIndex(null);
    });

    // ── agregar detalle ───────────────────────────────────────────────────────

    const addDetalle = () => {
        append({ productoId: undefined, cant: 1, lote: SIN_LOTE, cantidadUnidad: undefined, unidadDescripcion: "" });
    };

    // ── cuando cambia el almacén origen, recargar lotes de todas las filas ────

    const handleOrigenChange = async (newOrigenRaw: any) => {
        const origenId = getAlmacenId(newOrigenRaw);
        if (!origenId) return;
        const detalles = watch("detalles");
        const updates: Record<number, InProductoLotesStock> = {};
        for (let i = 0; i < detalles.length; i++) {
            const productoId = getProductoId(detalles[i].productoId);
            if (productoId) {
                try {
                    updates[i] = await getLotesConStockEnAlmacen(productoId, origenId);
                } catch { /* silencioso */ }
            }
        }
        setLotesMap(updates);
    };

    // ── stock del lote seleccionado en una fila ───────────────────────────────

    const getStockLoteSeleccionado = (index: number): number | undefined => {
        const info = lotesMap[index];
        if (!info) return undefined;
        const loteActual = watch(`detalles.${index}.lote`) ?? SIN_LOTE;
        const item = info.lotes.find((l) => (l.lote ?? SIN_LOTE) === loteActual);
        return item?.cantidad;
    };

    // ── submit ────────────────────────────────────────────────────────────────

    // Abre el dialogo de confirmacion de stock antes de guardar
    const handleGuardarClick = () => {
        handleSubmit((data) => {
            const origenId = getAlmacenId(data.origenAlmacenId);
            const destinoId = getAlmacenId(data.destinoAlmacenId);
            if (!origenId || !destinoId) { showMsg("Seleccione almacen origen y destino", "warning"); return; }
            if (origenId === destinoId) { showMsg("El almacen origen y destino no pueden ser el mismo", "warning"); return; }
            if (data.detalles.length === 0) { showMsg("Agregue al menos un producto al detalle", "warning"); return; }
            setConfirmOpen(true);
        })();
    };

    const onSubmit: SubmitHandler<TransferenciaForm> = async (data) => {
        const origenId = getAlmacenId(data.origenAlmacenId);
        const destinoId = getAlmacenId(data.destinoAlmacenId);

        if (!origenId || !destinoId) { showMsg("Seleccione almacén origen y destino", "warning"); return; }
        if (origenId === destinoId) { showMsg("El almacén origen y destino no pueden ser el mismo", "warning"); return; }
        if (data.detalles.length === 0) { showMsg("Agregue al menos un producto al detalle", "warning"); return; }

        // Validar stock por lote
        for (let i = 0; i < data.detalles.length; i++) {
            const stockLote = getStockLoteSeleccionado(i);
            if (stockLote !== undefined && data.detalles[i].cant > stockLote) {
                const nombre = nombreProducto(data.detalles[i].productoId);
                const lote = data.detalles[i].lote || "Sin lote";
                showMsg(`Stock insuficiente para "${nombre}" (${lote}): disponible ${stockLote}, solicitado ${data.detalles[i].cant}`, "error");
                return;
            }
        }

        const payload: InTransferenciaRequestDTO = {
            origenAlmacenId: origenId,
            destinoAlmacenId: destinoId,
            estadoId: data.estadoId,
            detalles: data.detalles.map((d) => ({
                productoId: typeof d.productoId === "object" ? d.productoId?.id : d.productoId,
                cant: d.cant,
                lote: d.lote || undefined,
                cantidadUnidad: d.cantidadUnidad,
                unidadDescripcion: d.unidadDescripcion,
            })),
        };

        try {
            let result: any;
            if (data.id) {
                result = await updateTransferencia(data.id, payload);
                showMsg("Transferencia actualizada correctamente", "success");
            } else {
                result = await createTransferencia(payload);
                showMsg("Transferencia creada correctamente", "success");
            }
            // Detectar items transferidos parcialmente (stock insuficiente al guardar)
            if (result?.detalles) {
                const parciales = result.detalles
                    .filter((d: any) => d.cantSolicitada != null && d.cantSolicitada > d.cant)
                    .map((d: any) => ({
                        nombre: typeof d.productoId === "object"
                            ? d.productoId?.nombreProducto ?? `Producto #${d.productoId?.id}`
                            : `Producto #${d.productoId}`,
                        solicitado: d.cantSolicitada as number,
                        transferido: d.cant as number,
                    }));
                if (parciales.length > 0) setPartialWarnings(parciales);
            }
            reset(initialForm);
            setLotesMap({});
            if (listLoaded) loadList();
        } catch {
            showMsg("Error al guardar la transferencia", "error");
        }
    };

    const handleAnular = async (id: number) => {
        try {
            await anularTransferencia(id);
            showMsg("Transferencia anulada", "success");
            loadList();
        } catch {
            showMsg("Error al anular la transferencia", "error");
        }
    };

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <main>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGuardarClick(); }}>
                <ActionBar title="Transferencia de Inventario">
                    <Button size="small" variant="contained" type="submit">Guardar</Button>
                    <Button size="small" variant="outlined" type="button" onClick={() => { reset(initialForm); setLotesMap({}); }}>Nuevo</Button>
                    <Button size="small" variant="outlined" type="button" onClick={loadList}>
                        {showList ? "Ocultar lista" : "Ver transferencias"}
                    </Button>
                </ActionBar>

                {/* cabecera */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Información General</Typography>
                    <Grid container spacing={2}>
                        <AlmacenComboBox
                            name="origenAlmacenId"
                            label="Almacén Origen"
                            control={control}
                            size={4}
                            rules={{ required: "Requerido" }}
                            onSelectionChange={handleOrigenChange}
                        />
                        <AlmacenComboBox
                            name="destinoAlmacenId"
                            label="Almacén Destino"
                            control={control}
                            size={4}
                            rules={{ required: "Requerido" }}
                        />
                    </Grid>
                </Paper>

                {/* detalles */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6">Productos ({fields.length})</Typography>
                        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addDetalle}>
                            Agregar producto
                        </Button>
                    </Box>

                    {fields.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                            Sin productos. Haz clic en "Agregar producto".
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        <TableCell width={120} align="center">Disponible total</TableCell>
                                        <TableCell width={210}>Lote</TableCell>
                                        <TableCell width={100} align="center">Stock lote</TableCell>
                                        <TableCell width={95}>Cantidad</TableCell>
                                        <TableCell width={110} align="center">Solicitado</TableCell>
                                        <TableCell width={120}>Unidad</TableCell>
                                        <TableCell width={50} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const infoLotes = lotesMap[index];
                                        const stockLote = getStockLoteSeleccionado(index);
                                        const cantActual = watch(`detalles.${index}.cant`) ?? 0;
                                        const excede = stockLote !== undefined && cantActual > stockLote;
                                        const cargando = loadingLotes[index];

                                        return (
                                            <TableRow key={field.id}>
                                                {/* Producto */}
                                                <TableCell>
                                                    <SearchButton
                                                        config={SEARCH_CONFIGS.PRODUCTO}
                                                        onOpenSearch={() => handleOpenProductSearch(index)}
                                                        variant="input"
                                                        size="small"
                                                        label="Producto"
                                                        displayValue={nombreProducto(watch(`detalles.${index}.productoId`))}
                                                        placeholder="Buscar producto..."
                                                    />
                                                </TableCell>

                                                {/* Disponible total */}
                                                <TableCell align="center">
                                                    {cargando ? (
                                                        <CircularProgress size={16} />
                                                    ) : infoLotes ? (
                                                        <Chip
                                                            label={`${infoLotes.totalDisponible} ud`}
                                                            size="small"
                                                            color={infoLotes.totalDisponible === 0 ? "error" : "success"}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.disabled">—</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Lote dropdown */}
                                                <TableCell>
                                                    {infoLotes ? (
                                                        <FormControl fullWidth size="small">
                                                            <Select
                                                                value={watch(`detalles.${index}.lote`) ?? SIN_LOTE}
                                                                onChange={(e) =>
                                                                    setValue(`detalles.${index}.lote`, e.target.value as string)
                                                                }
                                                                displayEmpty
                                                                sx={{ fontSize: "0.8rem" }}
                                                            >
                                                                {infoLotes.lotes.map((item) => {
                                                                    const key = item.lote ?? SIN_LOTE;
                                                                    const label = item.lote
                                                                        ? `Lote ${item.lote} — ${item.cantidad} ud`
                                                                        : `Sin lote — ${item.cantidad} ud`;
                                                                    return (
                                                                        <MenuItem key={key} value={key}
                                                                            sx={{ fontSize: "0.8rem" }}>
                                                                            {label}
                                                                        </MenuItem>
                                                                    );
                                                                })}
                                                                {infoLotes.lotes.length === 0 && (
                                                                    <MenuItem value={SIN_LOTE} disabled sx={{ fontSize: "0.8rem" }}>
                                                                        Sin stock disponible
                                                                    </MenuItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    ) : (
                                                        <AlphanumericInput
                                                            label=""
                                                            name={`detalles.${index}.lote`}
                                                            control={control}
                                                            size={12}
                                                        />
                                                    )}
                                                </TableCell>

                                                {/* Stock del lote seleccionado */}
                                                <TableCell align="center">
                                                    {stockLote !== undefined ? (
                                                        <Chip
                                                            label={`${stockLote} ud`}
                                                            size="small"
                                                            color={excede ? "error" : "primary"}
                                                            variant="outlined"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.disabled">—</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Cantidad a transferir */}
                                                <TableCell>
                                                    <NumericInput
                                                        label=""
                                                        name={`detalles.${index}.cant`}
                                                        control={control}
                                                        size={12}
                                                        rules={{ required: true, min: 1 }}
                                                        error={excede ? { message: `Máx ${stockLote}` } as any : undefined}
                                                    />
                                                </TableCell>

                                                {/* Solicitado / diferencia (solo visible cuando la fila tiene cantSolicitada != cant) */}
                                                <TableCell align="center">
                                                    {(() => {
                                                        const det = watch(`detalles.${index}`) as any;
                                                        const sol = det?.cantSolicitada as number | undefined;
                                                        const tra = det?.cant as number | undefined;
                                                        if (sol == null || sol === tra) {
                                                            return <Typography variant="body2" color="text.disabled">—</Typography>;
                                                        }
                                                        return (
                                                            <Tooltip title={`Solicitado: ${sol} | Transferido: ${tra}`}>
                                                                <Chip
                                                                    size="small"
                                                                    label={`${sol} → ${tra ?? 0}`}
                                                                    color="warning"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: "0.72rem" }}
                                                                />
                                                            </Tooltip>
                                                        );
                                                    })()}
                                                </TableCell>

                                                {/* Unidad */}
                                                <TableCell align="center">
                                                    {infoLotes?.unidadNombre ? (
                                                        <Tooltip
                                                            title={
                                                                infoLotes.esFraccionario
                                                                    ? `1 ${infoLotes.unidadNombre} = ${infoLotes.cantidadUnidad} ${infoLotes.unidadFraccionNombre ?? ""}`
                                                                    : `Unidad entera (${infoLotes.unidadNombre})`
                                                            }
                                                        >
                                                            <Chip
                                                                size="small"
                                                                label={
                                                                    infoLotes.esFraccionario
                                                                        ? `${infoLotes.unidadSigla} × ${infoLotes.cantidadUnidad} ${infoLotes.unidadFraccionSigla ?? ""}`
                                                                        : infoLotes.unidadNombre
                                                                }
                                                                color={infoLotes.esFraccionario ? "warning" : "default"}
                                                                variant="outlined"
                                                                sx={{ fontSize: "0.72rem" }}
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <AlphanumericInput
                                                            label=""
                                                            name={`detalles.${index}.unidadDescripcion`}
                                                            control={control}
                                                            size={12}
                                                            placeholder="unidad"
                                                        />
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <IconButton size="small" color="error" onClick={() => {
                                                        remove(index);
                                                        setLotesMap((prev) => {
                                                            const next = { ...prev };
                                                            delete next[index];
                                                            return next;
                                                        });
                                                    }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>

            {/* lista de transferencias */}
            {showList && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Transferencias registradas</Typography>
                    {transferencias.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                            No hay transferencias registradas.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Origen</TableCell>
                                        <TableCell>Destino</TableCell>
                                        <TableCell>Productos</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transferencias.map((t) => (
                                        <TableRow key={t.id} hover>
                                            <TableCell>{t.id}</TableCell>
                                            <TableCell>{nombreAlmacen(t.origenAlmacenId)}</TableCell>
                                            <TableCell>{nombreAlmacen(t.destinoAlmacenId)}</TableCell>
                                            <TableCell>{t.detalles?.length ?? 0}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={estadoLabel[t.estadoId ?? ""] ?? t.estadoId}
                                                    color={estadoColor[t.estadoId ?? ""] ?? "default"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {t.fechaReg ? new Date(t.fechaReg).toLocaleDateString("es-DO") : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={() => loadIntoForm(t)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {t.estadoId !== "INA" && (
                                                    <Tooltip title="Anular">
                                                        <IconButton size="small" color="error" onClick={() => handleAnular(t.id!)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* modal búsqueda de productos */}
            {productoSearch.config && (
                <ModalSearch
                    open={productoSearch.isOpen}
                    onClose={productoSearch.closeModal}
                    onSelect={handleProductoSelect}
                    config={productoSearch.config}
                    initialValues={productoSearch.initialValues}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            {/* Dialogo de confirmacion de stock antes de guardar */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    ⚠️ Confirmar transferencia
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>El stock mostrado puede haber cambiado desde que consultó los datos.</strong>
                        <br /><br />
                        Otras transacciones (ventas, ajustes u otras transferencias) pueden haber
                        reducido el inventario disponible desde el momento en que cargó esta pantalla.
                        <br /><br />
                        El sistema verificará el stock real al guardar y transferirá únicamente la
                        cantidad disponible en ese instante. Si hay diferencias, se le informará
                        después de guardar.
                        <br /><br />
                        ¿Desea continuar?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setConfirmOpen(false);
                            handleSubmit(onSubmit)();
                        }}
                    >
                        Sí, guardar transferencia
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogo de advertencia de transferencias parciales */}
            <Dialog
                open={partialWarnings.length > 0}
                onClose={() => setPartialWarnings([])}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: "warning.dark" }}>
                    ⚠️ Transferencia parcial — stock insuficiente al guardar
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Los siguientes productos tenían menos stock del solicitado en el momento
                        de guardar. Solo se transfirió lo disponible:
                    </DialogContentText>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Solicitado</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Transferido</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Diferencia</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {partialWarnings.map((w, i) => (
                                <TableRow key={i}>
                                    <TableCell>{w.nombre}</TableCell>
                                    <TableCell align="right">{w.solicitado}</TableCell>
                                    <TableCell align="right">{w.transferido}</TableCell>
                                    <TableCell align="right" sx={{ color: "error.main", fontWeight: 700 }}>
                                        -{w.solicitado - w.transferido}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setPartialWarnings([])}>
                        Entendido
                    </Button>
                </DialogActions>
            </Dialog>

        </main>
    );
};

export default TransferenciaView;
