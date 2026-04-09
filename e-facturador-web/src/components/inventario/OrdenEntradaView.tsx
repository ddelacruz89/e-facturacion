import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Snackbar,
    TextField,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useForm } from "react-hook-form";
import ActionBar from "../../customers/ActionBar";
import { AlmacenComboBox } from "../../customers/ProductComboBoxes";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { convertirOrdenCompraAOrdenEntrada } from "../../apis/OrdenEntradaController";

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

    const ordenSearch = useModalSearch();

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

    const handleOrdenSelect = ordenSearch.handleSelect(async (orden: any) => {
        setSelectedOrdenCompra(orden);

        const almacenId = getNumericId(almacenValue);
        if (!almacenId) {
            showSnackbar("Seleccione un almacén para convertir la orden", "info");
            return;
        }

        await convertirOrdenSeleccionada(getNumericId(orden?.id), almacenId, true);
    });

    const handleNuevo = () => {
        reset(initialValues);
        setSelectedOrdenCompra(null);
        setLastOrdenEntrada(null);
    };

    const onConvertir = async () => {
        const ordenCompraId = getNumericId(selectedOrdenCompra?.id);
        const almacenId = getNumericId(almacenValue);

        if (!ordenCompraId) {
            showSnackbar("Debe seleccionar una orden de compra", "error");
            return;
        }

        if (!almacenId) {
            showSnackbar("Debe seleccionar un almacén", "error");
            return;
        }

        await convertirOrdenSeleccionada(ordenCompraId, almacenId, true);
    };

    useEffect(() => {
        const ordenCompraId = getNumericId(selectedOrdenCompra?.id);
        const almacenId = getNumericId(almacenValue);

        if (!ordenCompraId || !almacenId) return;

        convertirOrdenSeleccionada(ordenCompraId, almacenId, false);
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
            <form onSubmit={handleSubmit(onConvertir)}>
                <ActionBar title="Órdenes de Entrada">
                    <Button type="submit" variant="contained" color="primary">
                        Convertir a entrada
                    </Button>
                    <Button type="button" variant="contained" color="primary" onClick={handleNuevo}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} sx={{ p: 2.5 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <SearchButton
                            config={SEARCH_CONFIGS.ORDEN_COMPRA}
                            initialValues={{ estadoId: "PEN" }}
                            onOpenSearch={ordenSearch.openModal}
                            variant="input"
                            label="Orden de compra"
                            displayValue={selectedOrdenCompra?.id ? `OC #${selectedOrdenCompra.id}` : ""}
                            placeholder="Seleccione una orden de compra pendiente"
                            size="small"
                        />
                    </Grid>

                    <AlmacenComboBox
                        control={control}
                        name="almacenId"
                        label="Almacén"
                        error={errors.almacenId as any}
                        size={6}
                    />
                </Grid>

                {selectedOrdenCompra && (
                    <Box sx={{ px: 2.5, pb: 2.5 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1.5 }}>
                                Resumen orden de compra
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField fullWidth size="small" label="ID" value={selectedOrdenCompra.id || ""} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Estado"
                                        value={selectedOrdenCompra.estadoId || ""}
                                        disabled
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Suplidor"
                                        value={selectedOrdenCompra.suplidorNombre || selectedOrdenCompra.suplidorId?.nombre || ""}
                                        disabled
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Total"
                                        value={selectedOrdenCompra.total ?? ""}
                                        disabled
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}

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
                                    <TextField fullWidth size="small" label="ID" value={lastOrdenEntrada.id || ""} disabled />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Almacén"
                                        value={lastOrdenEntrada.almacenId || ""}
                                        disabled
                                    />
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
                                <Grid size={{ xs: 12, md: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="ITBIS"
                                        value={formatCurrency(lastOrdenEntrada.itbis)}
                                        disabled
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
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
                            <Typography variant="h6" sx={{ mb: 1.5 }}>
                                Detalles convertidos
                            </Typography>
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
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Precio Unitario</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                            <TableCell align="right">ITBIS</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                            <TableCell align="center">Lote/Serie</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(lastOrdenEntrada?.inOrdenDetalleList || []).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    Sin detalles
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            (lastOrdenEntrada?.inOrdenDetalleList || []).map((detalle: any, idx: number) => (
                                                <TableRow key={detalle?.id || idx}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        {detalle?.productoId?.nombreProducto ||
                                                            detalle?.productoId?.nombre ||
                                                            detalle?.productoId?.id ||
                                                            ""}
                                                    </TableCell>
                                                    <TableCell align="right">{detalle?.cantidad ?? 0}</TableCell>
                                                    <TableCell align="right">{formatCurrency(detalle?.precioUnitario)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(detalle?.subTotal)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(detalle?.itbis)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(detalle?.total)}</TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            type="button"
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => openLoteModal(idx)}>
                                                            {detalle?.inOrdenDetalleLotes?.length
                                                                ? `Editar (${detalle.inOrdenDetalleLotes.length})`
                                                                : "Agregar"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
            </form>

            {ordenSearch.config && (
                <ModalSearch
                    open={ordenSearch.isOpen}
                    onClose={ordenSearch.closeModal}
                    onSelect={handleOrdenSelect}
                    config={ordenSearch.config}
                    initialValues={ordenSearch.initialValues}
                />
            )}

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
