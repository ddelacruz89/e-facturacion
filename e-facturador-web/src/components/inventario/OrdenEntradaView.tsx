import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Checkbox,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    InputAdornment,
    IconButton,
    Paper,
    Radio,
    RadioGroup,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { useForm } from "react-hook-form";
import ActionBar from "../../customers/ActionBar";
import { AlmacenComboBox } from "../../customers/ProductComboBoxes";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { convertirOrdenCompraAOrdenEntrada, getOrdenEntrada, saveOrdenEntrada, updateOrdenEntrada } from "../../apis/OrdenEntradaController";
import { getOrdenCompra } from "../../apis/OrdenCompraController";
import { getProducto } from "../../apis/ProductoController";

interface OrdenEntradaForm {
    almacenId?: number | string | { id?: number };
}

type LoteTipo = "SERIE" | "LOTE";

interface LoteDraft {
    cantidad: number;
    inLotes: {
        lote: string;
        serie: boolean;
        fechaVencimiento?: string;
    };
}

const initialValues: OrdenEntradaForm = {
    almacenId: undefined,
};

const OrdenEntradaView: React.FC = () => {
    const [selectedOrdenCompra, setSelectedOrdenCompra] = useState<any>(null);
    const [lastOrdenEntrada, setLastOrdenEntrada] = useState<any>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const [loteModalOpen, setLoteModalOpen] = useState(false);
    const [loteDetalleIndex, setLoteDetalleIndex] = useState<number | null>(null);
    const [loteTipo, setLoteTipo] = useState<LoteTipo>("SERIE");
    const [loteCodigo, setLoteCodigo] = useState("");
    const [loteCantidad, setLoteCantidad] = useState<number>(0);
    const [loteFechaVencimiento, setLoteFechaVencimiento] = useState("");
    const [loteItems, setLoteItems] = useState<LoteDraft[]>([]);

    // ── Estado del dialog de servicio ────────────────────────────────────────
    const [servicioDialogOpen, setServicioDialogOpen] = useState(false);
    const [servicioProducto, setServicioProducto] = useState<any>(null);
    const [servicioCantidad, setServicioCantidad] = useState<number>(1);
    const [servicioPrecio, setServicioPrecio] = useState<number>(0);
    const [servicioConItbis, setServicioConItbis] = useState(false);
    const [servicioUnidad, setServicioUnidad] = useState("");

    const ordenSearch = useModalSearch();
    const ordenEntradaSearch = useModalSearch();
    const productoServicioSearch = useModalSearch();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<OrdenEntradaForm>({
        defaultValues: initialValues,
    });

    const almacenValue = watch("almacenId");

    const getNumericId = (value: any): number | undefined => {
        if (value === undefined || value === null || value === "") return undefined;
        if (typeof value === "object") return value.id;

        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const convertirOrdenSeleccionada = async (ordenCompraId?: number, almacenId?: number, showSuccess?: boolean) => {
        if (!ordenCompraId || !almacenId) return;

        try {
            const ordenEntrada = await convertirOrdenCompraAOrdenEntrada(ordenCompraId, almacenId);
            setLastOrdenEntrada(ordenEntrada);
            if (showSuccess) {
                showSnackbar("Orden de entrada generada correctamente", "success");
            }
        } catch (error: any) {
            showSnackbar(error?.message || "Error al convertir la orden de compra", "error");
        }
    };

    const handleOrdenSelect = ordenSearch.handleSelect(async (resumen: any) => {
        try {
            const ordenCompleta = await getOrdenCompra(resumen.id);
            setSelectedOrdenCompra(ordenCompleta);

            const almacenId = getNumericId(almacenValue);
            if (almacenId) {
                await convertirOrdenSeleccionada(resumen.id, almacenId, true);
            }
        } catch (error: any) {
            showSnackbar(error?.message || "Error al cargar la orden de compra", "error");
        }
    });

    const handleOrdenEntradaSelect = ordenEntradaSearch.handleSelect(async (orden: any) => {
        try {
            const oe = await getOrdenEntrada(orden.id);
            setLastOrdenEntrada(oe);
            setSelectedOrdenCompra(null);
            showSnackbar(`Orden de entrada #${oe.id} cargada`, "success");
        } catch (error: any) {
            showSnackbar(error?.message || "Error al cargar la orden de entrada", "error");
        }
    });

    // ── Handlers del dialog de servicio ─────────────────────────────────────

    const handleProductoServicioSelect = productoServicioSearch.handleSelect(async (producto: any) => {
        try {
            const productoCompleto = await getProducto(producto.id);
            setServicioProducto(productoCompleto);
            if (productoCompleto?.precioVenta != null) {
                setServicioPrecio(Number(productoCompleto.precioVenta));
            }
        } catch {
            setServicioProducto(producto);
        }
    });

    const openServicioDialog = () => {
        setServicioProducto(null);
        setServicioCantidad(1);
        setServicioPrecio(0);
        setServicioConItbis(false);
        setServicioUnidad("");
        setServicioDialogOpen(true);
    };

    const ITBIS_RATE = 0.18;

    const handleAgregarServicio = () => {
        if (!servicioProducto) {
            showSnackbar("Debe seleccionar un producto de servicio", "error");
            return;
        }
        if (!servicioUnidad.trim()) {
            showSnackbar("La unidad es requerida (Ej: Unidad, Servicio, Viaje...)", "error");
            return;
        }
        if (servicioCantidad <= 0) {
            showSnackbar("La cantidad debe ser mayor a cero", "error");
            return;
        }
        if (servicioPrecio <= 0) {
            showSnackbar("El precio debe ser mayor a cero", "error");
            return;
        }

        const subTotal = servicioCantidad * servicioPrecio;
        const itbisMonto = servicioConItbis ? subTotal * ITBIS_RATE : 0;
        const total = subTotal + itbisMonto;

        const nuevaLinea = {
            productoId: servicioProducto,
            cantidad: servicioCantidad,
            precioUnitario: servicioPrecio,
            subTotal,
            itbis: itbisMonto,
            total,
            descuentoPorciento: 0,
            extra: false,
            servicio: true,
            unidadNombre: servicioUnidad.trim(),
            unidadCantidad: 1,
            inOrdenDetalleLotes: [],
        };

        const detalles = [...(lastOrdenEntrada?.inOrdenDetalleList || []), nuevaLinea];
        setLastOrdenEntrada({
            ...lastOrdenEntrada,
            inOrdenDetalleList: detalles,
            monto: (lastOrdenEntrada?.monto || 0) + subTotal,
            itbis: (lastOrdenEntrada?.itbis || 0) + itbisMonto,
            total: (lastOrdenEntrada?.total || 0) + total,
        });

        setServicioDialogOpen(false);
        showSnackbar("Servicio agregado a la orden", "success");
    };

    const handleNuevo = () => {
        reset(initialValues);
        setSelectedOrdenCompra(null);
        setLastOrdenEntrada(null);
    };

    const handleGuardar = async () => {
        if (!lastOrdenEntrada) {
            showSnackbar("No hay orden de entrada para guardar", "error");
            return;
        }

        // Verificar que todos los detalles de PRODUCTO (no servicio) tengan lotes/series asignados
        const detalles: any[] = lastOrdenEntrada.inOrdenDetalleList || [];
        const sinLote = detalles.filter(
            (d: any) => !d.servicio && (!d.inOrdenDetalleLotes || d.inOrdenDetalleLotes.length === 0),
        );
        if (sinLote.length > 0) {
            const nombres = sinLote
                .map((d: any) => d.productoId?.nombreProducto || d.productoId?.nombre || `Línea ${detalles.indexOf(d) + 1}`)
                .join(", ");
            showSnackbar(`Faltan lotes/series en: ${nombres}`, "error");
            return;
        }

        const almacenId = getNumericId(almacenValue);
        if (!almacenId && !lastOrdenEntrada.id) {
            showSnackbar("Debe seleccionar un almacén destino", "error");
            return;
        }

        const ordenAGuardar = lastOrdenEntrada.id
            ? lastOrdenEntrada
            : { ...lastOrdenEntrada, almacenId };

        try {
            const saved = lastOrdenEntrada.id
                ? await updateOrdenEntrada(lastOrdenEntrada.id, ordenAGuardar)
                : await saveOrdenEntrada(ordenAGuardar);
            setLastOrdenEntrada(saved);
            showSnackbar("Orden de entrada guardada correctamente", "success");
        } catch (error: any) {
            showSnackbar(error?.message || "Error al guardar la orden de entrada", "error");
        }
    };

    useEffect(() => {
        const ordenCompraId = getNumericId(selectedOrdenCompra?.id);
        const almacenId = getNumericId(almacenValue);

        if (!ordenCompraId || !almacenId) return;

        convertirOrdenSeleccionada(ordenCompraId, almacenId, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [almacenValue]);

    const formatCurrency = (value: any) => {
        const num = Number(value ?? 0);
        if (Number.isNaN(num)) return "0.00";
        return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getDetalleCantidad = () => {
        if (loteDetalleIndex === null) return 0;
        const detalle = lastOrdenEntrada?.inOrdenDetalleList?.[loteDetalleIndex];
        return Number(detalle?.cantidad || 0);
    };

    const getCantidadAsignada = () => {
        return loteItems.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    };

    const getCantidadRestante = () => {
        return Math.max(getDetalleCantidad() - getCantidadAsignada(), 0);
    };

    const resetLoteForm = () => {
        setLoteCodigo("");
        setLoteCantidad(0);
        setLoteFechaVencimiento("");
    };

    const openLoteModal = (detalleIndex: number) => {
        const detalle = lastOrdenEntrada?.inOrdenDetalleList?.[detalleIndex];
        const existing: LoteDraft[] = (detalle?.inOrdenDetalleLotes || []).map((item: any) => ({
            cantidad: Number(item?.cantidad || 0),
            inLotes: {
                lote: item?.inLotes?.lote || "",
                serie: Boolean(item?.inLotes?.serie),
                fechaVencimiento: item?.inLotes?.fechaVencimiento || "",
            },
        }));

        const inferredTipo: LoteTipo = existing.length > 0 ? (existing[0]?.inLotes?.serie ? "SERIE" : "LOTE") : "SERIE";

        setLoteDetalleIndex(detalleIndex);
        setLoteItems(existing);
        setLoteTipo(inferredTipo);
        resetLoteForm();
        setLoteModalOpen(true);
    };

    const handleLoteTipoChange = (nextTipo: LoteTipo) => {
        if (loteItems.length > 0) {
            setLoteItems([]);
            showSnackbar("Se limpiaron las líneas para cambiar entre lote y serie", "info");
        }

        setLoteTipo(nextTipo);
        resetLoteForm();
    };

    const handleAddLoteItem = () => {
        const restante = getCantidadRestante();

        if (!loteCodigo.trim()) {
            showSnackbar("Debe indicar el código de lote o serie", "error");
            return;
        }

        if (!loteCantidad || loteCantidad <= 0) {
            showSnackbar("La cantidad debe ser mayor a cero", "error");
            return;
        }

        if (loteCantidad > restante) {
            showSnackbar("La cantidad no puede superar lo pendiente por asignar", "error");
            return;
        }

        if (loteTipo === "LOTE" && !loteFechaVencimiento) {
            showSnackbar("Para lote debe indicar fecha de vencimiento", "error");
            return;
        }

        const newItem: LoteDraft = {
            cantidad: Number(loteCantidad),
            inLotes: {
                lote: loteCodigo.trim(),
                serie: loteTipo === "SERIE",
                fechaVencimiento: loteTipo === "LOTE" ? loteFechaVencimiento : undefined,
            },
        };

        setLoteItems((prev) => [...prev, newItem]);
        resetLoteForm();
    };

    const handleRemoveLoteItem = (idx: number) => {
        setLoteItems((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleGuardarLotes = () => {
        if (loteDetalleIndex === null || !lastOrdenEntrada) return;

        if (getCantidadAsignada() !== getDetalleCantidad()) {
            showSnackbar("La suma de lotes/series debe ser igual a la cantidad del detalle", "error");
            return;
        }

        const updatedDetalles = [...(lastOrdenEntrada.inOrdenDetalleList || [])];
        const detalleActual = updatedDetalles[loteDetalleIndex];

        updatedDetalles[loteDetalleIndex] = {
            ...detalleActual,
            inOrdenDetalleLotes: loteItems,
        };

        setLastOrdenEntrada({
            ...lastOrdenEntrada,
            inOrdenDetalleList: updatedDetalles,
        });

        setLoteModalOpen(false);
        setLoteDetalleIndex(null);
        setLoteItems([]);
        resetLoteForm();
        showSnackbar("Lotes/series guardados en el detalle", "success");
    };

    return (
        <>
            <div>
                <ActionBar title="Órdenes de Entrada">
                    {lastOrdenEntrada && (
                        <Button type="button" variant="contained" color="success" onClick={handleGuardar}>
                            Guardar
                        </Button>
                    )}
                    <Button type="button" variant="contained" color="primary" onClick={handleNuevo}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} sx={{ p: 2.5 }}>
                    <AlmacenComboBox
                        control={control}
                        name="almacenId"
                        label="Almacén destino"
                        error={errors.almacenId as any}
                        size={4}
                        disabled={!!lastOrdenEntrada?.id}
                    />

                    <Grid size={{ xs: 12, md: 4 }}>
                        <SearchButton
                            config={SEARCH_CONFIGS.ORDEN_COMPRA}
                            initialValues={{ estadoId: "PEN" }}
                            onOpenSearch={ordenSearch.openModal}
                            variant="input"
                            label="Orden de compra"
                            displayValue={selectedOrdenCompra?.id ? `OC #${selectedOrdenCompra.id}` : ""}
                            placeholder="Seleccione una orden de compra pendiente"
                            size="small"
                            disabled={!getNumericId(almacenValue) || !!lastOrdenEntrada?.id}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <SearchButton
                            config={SEARCH_CONFIGS.ORDEN_ENTRADA}
                            onOpenSearch={ordenEntradaSearch.openModal}
                            variant="input"
                            label="Orden de entrada"
                            displayValue={lastOrdenEntrada?.id ? `OE #${lastOrdenEntrada.id}` : ""}
                            placeholder="Buscar orden de entrada existente"
                            size="small"
                        />
                    </Grid>
                </Grid>


                {lastOrdenEntrada && (
                    <Box sx={{ px: 2.5, pb: 2.5 }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Orden de entrada creada con ID: {lastOrdenEntrada.id}
                        </Alert>

                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1.5 }}>
                                Resumen orden de entrada
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField fullWidth size="small" label="ID" value={lastOrdenEntrada.id || "Nuevo"} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Monto"
                                        value={formatCurrency(lastOrdenEntrada.monto)}
                                        disabled
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="ITBIS"
                                        value={formatCurrency(lastOrdenEntrada.itbis)}
                                        disabled
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Total"
                                        value={formatCurrency(lastOrdenEntrada.total)}
                                        disabled
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                <Typography variant="h6">Detalles convertidos</Typography>
                                {!lastOrdenEntrada?.id && (
                                    <Button
                                        type="button"
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<MiscellaneousServicesIcon />}
                                        onClick={openServicioDialog}>
                                        Agregar Servicio
                                    </Button>
                                )}
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead
                                        sx={{
                                            backgroundColor: "#00695c",
                                            "& .MuiTableCell-root": {
                                                color: "#ffffff",
                                                fontWeight: 700,
                                                borderBottomColor: "rgba(255, 255, 255, 0.12)",
                                            },
                                        }}>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Producto / Servicio</TableCell>
                                            <TableCell>Unidad</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Precio</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                            <TableCell align="right">ITBIS</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                            <TableCell align="center">Lote/Serie</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(lastOrdenEntrada?.inOrdenDetalleList || []).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center">
                                                    Sin detalles
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            (lastOrdenEntrada?.inOrdenDetalleList || []).map((detalle: any, idx: number) => {
                                                const esServicio = Boolean(detalle?.servicio);
                                                const sinLoteProducto =
                                                    !esServicio &&
                                                    (!detalle?.inOrdenDetalleLotes ||
                                                        detalle.inOrdenDetalleLotes.length === 0);
                                                return (
                                                    <TableRow
                                                        key={detalle?.id || idx}
                                                        sx={
                                                            esServicio
                                                                ? { backgroundColor: "rgba(2, 136, 209, 0.06)" }
                                                                : sinLoteProducto
                                                                  ? { backgroundColor: "rgba(211, 47, 47, 0.08)" }
                                                                  : {}
                                                        }>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                {esServicio && (
                                                                    <Chip
                                                                        label="Servicio"
                                                                        size="small"
                                                                        color="info"
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                                {detalle?.productoId?.nombreProducto ||
                                                                    detalle?.productoId?.nombre ||
                                                                    detalle?.productoId?.id ||
                                                                    ""}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {detalle?.unidadNombre
                                                                ? `${detalle.unidadNombre}${detalle.unidadCantidad ? ` / ${detalle.unidadCantidad}` : ""}`
                                                                : "—"}
                                                        </TableCell>
                                                        <TableCell align="right">{detalle?.cantidad ?? 0}</TableCell>
                                                        <TableCell align="right">{formatCurrency(detalle?.precioUnitario)}</TableCell>
                                                        <TableCell align="right">{formatCurrency(detalle?.subTotal)}</TableCell>
                                                        <TableCell align="right">{formatCurrency(detalle?.itbis)}</TableCell>
                                                        <TableCell align="right">{formatCurrency(detalle?.total)}</TableCell>
                                                        <TableCell align="center">
                                                            {esServicio ? (
                                                                <Chip label="N/A" size="small" variant="outlined" />
                                                            ) : (
                                                                <Button
                                                                    type="button"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    onClick={() => openLoteModal(idx)}>
                                                                    {detalle?.inOrdenDetalleLotes?.length
                                                                        ? `Editar (${detalle.inOrdenDetalleLotes.length})`
                                                                        : "Agregar"}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
            </div>

            {ordenSearch.config && (
                <ModalSearch
                    open={ordenSearch.isOpen}
                    onClose={ordenSearch.closeModal}
                    onSelect={handleOrdenSelect}
                    config={ordenSearch.config}
                    initialValues={ordenSearch.initialValues}
                />
            )}

            {ordenEntradaSearch.config && (
                <ModalSearch
                    open={ordenEntradaSearch.isOpen}
                    onClose={ordenEntradaSearch.closeModal}
                    onSelect={handleOrdenEntradaSelect}
                    config={ordenEntradaSearch.config}
                    initialValues={ordenEntradaSearch.initialValues}
                />
            )}

            {/* Modal búsqueda de producto para servicio */}
            {productoServicioSearch.config && (
                <ModalSearch
                    open={productoServicioSearch.isOpen}
                    onClose={productoServicioSearch.closeModal}
                    onSelect={handleProductoServicioSelect}
                    config={productoServicioSearch.config}
                    initialValues={productoServicioSearch.initialValues}
                />
            )}

            {/* Dialog agregar servicio */}
            <Dialog open={servicioDialogOpen} onClose={() => setServicioDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <MiscellaneousServicesIcon color="secondary" />
                        Agregar Servicio / Gasto
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {/* Búsqueda de producto */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Producto / Servicio"
                                value={servicioProducto?.nombreProducto || ""}
                                placeholder="Haga clic en 🔍 para buscar"
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Buscar producto">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() =>
                                                        productoServicioSearch.openModal(
                                                            SEARCH_CONFIGS.PRODUCTO_SERVICIO,
                                                        )
                                                    }>
                                                    <SearchIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Unidad */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Unidad *"
                                value={servicioUnidad}
                                placeholder="Ej: Unidad, Servicio, Viaje..."
                                onChange={(e) => setServicioUnidad(e.target.value)}
                            />
                        </Grid>

                        {/* Cantidad */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Cantidad"
                                value={servicioCantidad || ""}
                                inputProps={{ min: 1 }}
                                onChange={(e) => setServicioCantidad(Math.max(1, Number(e.target.value) || 1))}
                            />
                        </Grid>

                        {/* Precio */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Precio unitario"
                                value={servicioPrecio || ""}
                                disabled
                                helperText="Precio tomado del producto"
                            />
                        </Grid>

                        {/* ITBIS */}
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={servicioConItbis}
                                        onChange={(e) => setServicioConItbis(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Aplica ITBIS (18%)"
                            />
                        </Grid>

                        {/* Vista previa de totales */}
                        {servicioPrecio > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: "action.hover",
                                        display: "flex",
                                        gap: 3,
                                    }}>
                                    {(() => {
                                        const sub = servicioCantidad * servicioPrecio;
                                        const itb = servicioConItbis ? sub * ITBIS_RATE : 0;
                                        return (
                                            <>
                                                <Typography variant="body2">
                                                    Subtotal: <strong>{formatCurrency(sub)}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    ITBIS: <strong>{formatCurrency(itb)}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    Total: <strong>{formatCurrency(sub + itb)}</strong>
                                                </Typography>
                                            </>
                                        );
                                    })()}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button type="button" color="inherit" onClick={() => setServicioDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="contained" color="secondary" onClick={handleAgregarServicio}>
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Dialog open={loteModalOpen} onClose={() => setLoteModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Crear lote o serie</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="Cantidad pedida" value={getDetalleCantidad()} disabled />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="Cantidad restante" value={getCantidadRestante()} disabled />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Elegir
                            </Typography>
                            <RadioGroup row value={loteTipo} onChange={(e) => handleLoteTipoChange(e.target.value as LoteTipo)}>
                                <FormControlLabel value="SERIE" control={<Radio size="small" />} label="Serie" />
                                <FormControlLabel value="LOTE" control={<Radio size="small" />} label="Lote" />
                            </RadioGroup>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label={loteTipo === "SERIE" ? "Serie" : "Lote"}
                                value={loteCodigo}
                                onChange={(e) => setLoteCodigo(e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Cantidad"
                                value={loteCantidad || ""}
                                onChange={(e) => setLoteCantidad(Number(e.target.value) || 0)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Fecha vencimiento"
                                value={loteFechaVencimiento}
                                onChange={(e) => setLoteFechaVencimiento(e.target.value)}
                                disabled={loteTipo !== "LOTE"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ height: "40px" }}
                                onClick={handleAddLoteItem}>
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Tipo</TableCell>
                                        <TableCell>Código</TableCell>
                                        <TableCell align="right">Cantidad</TableCell>
                                        <TableCell>Vence</TableCell>
                                        <TableCell align="center">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loteItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                Sin líneas agregadas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        loteItems.map((item, idx) => (
                                            <TableRow key={`${item.inLotes.lote}-${idx}`}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{item.inLotes.serie ? "Serie" : "Lote"}</TableCell>
                                                <TableCell>{item.inLotes.lote}</TableCell>
                                                <TableCell align="right">{item.cantidad}</TableCell>
                                                <TableCell>{item.inLotes.fechaVencimiento || "-"}</TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        type="button"
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveLoteItem(idx)}>
                                                        Quitar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button type="button" onClick={resetLoteForm}>
                        Limpiar
                    </Button>
                    <Button type="button" color="inherit" onClick={() => setLoteModalOpen(false)}>
                        Cerrar
                    </Button>
                    <Button type="button" variant="contained" onClick={handleGuardarLotes}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OrdenEntradaView;
