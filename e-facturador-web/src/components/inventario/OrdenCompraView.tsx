import React, { useState } from "react";
import {
    Button,
    Divider,
    Snackbar,
    Alert,
    IconButton,
    Box,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { TextInputPk, ConfirmationModal } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { InOrdenCompraFormDTO, InOrdenCompraDetalleFormDTO } from "../../models/inventario";
import { MgProducto } from "../../models/producto";
import { saveOrdenCompra } from "../../apis/OrdenCompraController";
import { validateOrdenCompra, validateOrdenCompraBusinessRules } from "../../validations/ordenCompraValidation";
import { formatCurrency } from "../../utils/FacturaUtils";
import { SuplidorComboBox } from "../../customers/ProductComboBoxes";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import apiClient from "../../services/apiClient";

const initialOrdenCompra: InOrdenCompraFormDTO = {
    id: undefined,
    subTotal: 0,
    itbis: 0,
    total: 0,
    descuento: 0,
    suplidorId: undefined,
    estadoId: "ACT",
    detalles: [],
};

interface DetalleFormState {
    productoId?: number | MgProducto;
    unidadId?: number;
    unidadNombre?: string;
    cantidad: number;
    precioUnitario: number;
    itbisProducto: number;
    descuentoPorciento: number;
    descuentoCantidad: number;
    subTotal: number;
    itbis: number;
    total: number;
}

const initialDetalle: DetalleFormState = {
    cantidad: 1,
    precioUnitario: 0,
    itbisProducto: 0,
    descuentoPorciento: 0,
    descuentoCantidad: 0,
    subTotal: 0,
    itbis: 0,
    total: 0,
};

export const OrdenCompraView: React.FC = () => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<InOrdenCompraFormDTO | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">("error");
    const [detalleForm, setDetalleForm] = useState<DetalleFormState>(initialDetalle);
    const [selectedProducto, setSelectedProducto] = useState<any>(null);
    const [unidadesDisponibles, setUnidadesDisponibles] = useState<any[]>([]);
    const [accordionExpanded, setAccordionExpanded] = useState<boolean>(false);
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
    const [tempCantidad, setTempCantidad] = useState<number>(0);

    const ordenSearch = useModalSearch();
    const ordenListSearch = useModalSearch();
    const productoSearch = useModalSearch();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<InOrdenCompraFormDTO>({
        defaultValues: initialOrdenCompra,
    });

    const { fields, append, remove, update } = useFieldArray({ control, name: "detalles" });
    const detalles = watch("detalles");
    const suplidorId = watch("suplidorId");
    const estadoId = watch("estadoId");

    const getDetalleProductoId = (detalle: { productoId?: number | MgProducto }): number | undefined =>
        typeof detalle?.productoId === "object" && detalle?.productoId !== null ? detalle.productoId.id : detalle?.productoId;

    const getDetalleProductoNombre = (detalle: { productoId?: number | MgProducto }): string => {
        if (typeof detalle?.productoId === "object" && detalle?.productoId !== null) {
            return detalle.productoId.nombreProducto || (detalle.productoId as any).nombre || "";
        }

        return detalle?.productoId ? String(detalle.productoId) : "";
    };

    const normalizeDetalle = (detalle: any): InOrdenCompraDetalleFormDTO => ({
        ...detalle,
        productoId: detalle?.productoId,
    });

    const handleCantidadChange = (idx: number, nuevaCantidad: number) => {
        if (!detalles) return;
        const detalle = detalles[idx];
        if (!detalle) return;

        const subtotal = nuevaCantidad * detalle.precioUnitario;
        const itbisValue = subtotal * ((detalle.itbisProducto || 0) / 100);
        const total = subtotal + itbisValue;

        update(idx, {
            ...detalle,
            cantidad: nuevaCantidad,
            subTotal: subtotal,
            itbis: itbisValue,
            total: total,
        });
    };

    const handleStartEdit = (idx: number, currentCantidad: number) => {
        const detalle = detalles?.[idx] as any;
        if (detalle?.estadoId && detalle.estadoId !== "ACT") {
            setSnackbarMessage("No puede editar una fila deshabilitada");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setEditingRowIndex(idx);
        setTempCantidad(currentCantidad);
    };

    const handleConfirmEdit = (idx: number) => {
        handleCantidadChange(idx, tempCantidad);
        setEditingRowIndex(null);
    };

    const handleToggleEnviarEntrada = () => {
        const nextEstado = estadoId === "PEN" ? "ACT" : "PEN";
        setValue("estadoId", nextEstado);
    };

    const onSubmit: SubmitHandler<InOrdenCompraFormDTO> = async (data) => {
        // Calculate and update totals before validation
        const totales = { subTotal: 0, itbis: 0, total: 0 };
        data.detalles?.forEach((d) => {
            if ((d as any)?.estadoId && (d as any).estadoId !== "ACT") return;
            totales.subTotal += d.subTotal || 0;
            totales.itbis += d.itbis || 0;
            totales.total += d.total || 0;
        });

        // Update data with calculated totals
        data.subTotal = totales.subTotal;
        data.itbis = totales.itbis;
        data.total = totales.total;

        const validation = await validateOrdenCompra(data);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            setSnackbarMessage(String(errorMessage || "Error de validación"));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const businessValidation = validateOrdenCompraBusinessRules(data);
        if (!businessValidation.isValid) {
            const errorMessage = Object.values(businessValidation.errors)[0];
            setSnackbarMessage(String(errorMessage));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setPendingData(data);
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;
        try {
            await saveOrdenCompra(pendingData);
            reset(initialOrdenCompra);
            setShowConfirmModal(false);
            setSnackbarMessage("Orden de compra guardada exitosamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage("Error al guardar orden de compra");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleOrdenSelect = ordenSearch.handleSelect((orden: any) => {
        // Load selected orden into form
        reset({
            id: orden.id,
            subTotal: orden.subTotal,
            itbis: orden.itbis,
            total: orden.total,
            descuento: orden.descuento,
            suplidorId: orden.suplidorId,
            estadoId: orden.estadoId,
            detalles: (orden.detalles || []).map(normalizeDetalle),
        });
    });

    const handleOrdenListSelect = ordenListSearch.handleSelect(async (orden: any) => {
        try {
            console.log("🔍 Fetching orden de compra con ID:", orden.id);

            // Fetch complete orden de compra with details
            const ordenCompleta = await apiClient.get(`/api/v1/inventario/ordenes-compras/${orden.id}`);
            const responseData = ordenCompleta.data;
            const ordenData = responseData?.content ?? responseData;
            const detallesOrden = (ordenData?.detalles ?? ordenData?.inOrdenesComprasDetallesList ?? []).map(normalizeDetalle);

            console.log("📦 Datos de orden completa recibidos:", ordenData);
            console.log("📋 Detalles de la orden:", detallesOrden);

            // Load selected orden into form
            reset({
                id: ordenData?.id,
                subTotal: ordenData.subTotal || 0,
                itbis: ordenData.itbis || 0,
                total: ordenData.total || 0,
                descuento: ordenData.descuento || 0,
                suplidorId: ordenData.suplidorId,
                estadoId: ordenData.estadoId || "ACT",
                detalles: detallesOrden,
            });

            console.log("✅ Formulario actualizado con la orden de compra");
        } catch (error) {
            console.error("❌ Error al cargar orden de compra:", error);
            setSnackbarMessage("Error al cargar los detalles de la orden de compra");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    });

    const handleProductoSelect = productoSearch.handleSelect(async (producto: any) => {
        try {
            // Extract the ID if suplidorId is an object
            const actualSuplidorId = typeof suplidorId === "object" && suplidorId !== null ? (suplidorId as any).id : suplidorId;

            // Fetch complete product details with suplidorId filter
            const response = await apiClient.get(
                `/api/producto/disponibles-compra/${producto.id}/suplidorId/${actualSuplidorId}`,
            );
            const productoCompleto = response.data;

            setSelectedProducto(productoCompleto);
            // Store unidadSuplidor as an array for compatibility with the dropdown
            const unidadesArray = productoCompleto.unidadSuplidor ? [productoCompleto.unidadSuplidor] : [];
            setUnidadesDisponibles(unidadesArray);

            // Get the unidadSuplidor and its precio
            const unidadSuplidor = productoCompleto.unidadSuplidor;
            const precioSuplidor = unidadSuplidor?.suplidor?.precio || 0;

            const cantidad = 1;
            const itbis = productoCompleto.itbis || 0;

            // Calcular subtotal, itbis y total
            const subtotal = cantidad * precioSuplidor;
            const itbisValue = subtotal * (itbis / 100);
            const total = subtotal + itbisValue;

            setDetalleForm((prev) => ({
                ...prev,
                productoId: productoCompleto,
                unidadId: unidadSuplidor?.id,
                unidadNombre: unidadSuplidor?.unidadNombre || "",
                cantidad: cantidad,
                precioUnitario: precioSuplidor,
                itbisProducto: itbis,
                subTotal: subtotal,
                itbis: itbisValue,
                total: total,
            }));
        } catch (error) {
            console.error("Error al obtener detalles del producto:", error);
            setSnackbarMessage("Error al cargar los detalles del producto");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    });

    const handleOpenProductoSearch = () => {
        if (!suplidorId) {
            setSnackbarMessage("Debe seleccionar un suplidor primero");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // Extract the ID if suplidorId is an object
        const actualSuplidorId = typeof suplidorId === "object" && suplidorId !== null ? (suplidorId as any).id : suplidorId;

        if (!actualSuplidorId) {
            setSnackbarMessage("Debe seleccionar un suplidor primero");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const productoConfig = {
            ...SEARCH_CONFIGS.PRODUCTO,
            title: "Buscar Productos del Suplidor",
            endpoint: `/api/producto/disponibles-compra/suplidor/${actualSuplidorId}`,
        };

        productoSearch.openModal(productoConfig);
    };

    const handleUnidadChange = (unidadId: number) => {
        const unidadSeleccionada = unidadesDisponibles.find((u: any) => u.id === unidadId);
        if (!unidadSeleccionada) return;

        // Get the supplier price from the unidadSuplidor structure
        const precioSuplidor = unidadSeleccionada.suplidor?.precio || selectedProducto?.precio || 0;

        setDetalleForm((prev) => ({
            ...prev,
            unidadId: unidadSeleccionada.id,
            unidadNombre: unidadSeleccionada.unidadNombre,
            precioUnitario: precioSuplidor,
        }));
    };

    const handleDetalleChange = (field: keyof DetalleFormState, value: number) => {
        setDetalleForm((prev) => {
            const updated = { ...prev, [field]: value };

            // Recalculate when relevant fields change
            if (["cantidad", "precioUnitario", "itbisProducto"].includes(field)) {
                // Subtotal = cantidad * precio
                const subtotal = (updated.cantidad || 0) * (updated.precioUnitario || 0);

                // ITBIS = subtotal * (itbis% / 100)
                const itbisValue = subtotal * ((updated.itbisProducto || 0) / 100);

                // Total = subtotal + itbis
                const total = subtotal + itbisValue;

                updated.subTotal = subtotal;
                updated.itbis = itbisValue;
                updated.total = total;
            }

            return updated;
        });
    };

    const isDetalleGuardado = (detalle: any) => Boolean(detalle?.id);

    const isDetalleActivo = (detalle: any) => (detalle?.estadoId || "ACT") === "ACT";

    const handleToggleDetalleEstado = (idx: number) => {
        const detalle = detalles?.[idx] as any;
        if (!detalle || !isDetalleGuardado(detalle)) return;

        const nextEstado = isDetalleActivo(detalle) ? "CAN" : "ACT";
        update(idx, {
            ...detalle,
            estadoId: nextEstado,
        });

        if (editingRowIndex === idx) {
            setEditingRowIndex(null);
        }
    };

    const handleRemoveDetalle = (idx: number) => {
        const detalle = detalles?.[idx] as any;
        if (!detalle) return;

        if (isDetalleGuardado(detalle)) {
            setSnackbarMessage("Las filas guardadas no se pueden eliminar; solo habilitar o deshabilitar");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        remove(idx);
    };

    const handleAddDetalle = () => {
        if (!detalleForm.productoId) {
            setSnackbarMessage("Debe seleccionar un producto");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!getDetalleProductoId(detalleForm)) {
            setSnackbarMessage("Debe seleccionar un producto válido");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        append({
            productoId: detalleForm.productoId,
            cantidad: detalleForm.cantidad,
            precioUnitario: detalleForm.precioUnitario,
            itbisProducto: detalleForm.itbisProducto,
            descuentoPorciento: detalleForm.descuentoPorciento,
            descuentoCantidad: detalleForm.descuentoCantidad,
            subTotal: detalleForm.subTotal,
            itbis: detalleForm.itbis,
            total: detalleForm.total,
            estadoId: "ACT",
        } as InOrdenCompraDetalleFormDTO);

        // Reset form
        setDetalleForm(initialDetalle);
        setSelectedProducto(null);
        setUnidadesDisponibles([]);
    };

    const calculateTotals = () => {
        const totales = { subTotal: 0, itbis: 0, total: 0 };
        detalles?.forEach((d) => {
            if ((d as any)?.estadoId && (d as any).estadoId !== "ACT") return;
            totales.subTotal += d.subTotal || 0;
            totales.itbis += d.itbis || 0;
            totales.total += d.total || 0;
        });
        return totales;
    };

    const totales = calculateTotals();

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Órdenes de Compra">
                    <Button variant="contained" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button variant="contained" color="primary" type="button" onClick={() => reset(initialOrdenCompra)}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Box display="flex" gap={1} alignItems="flex-start">
                            <TextInputPk control={control} name="id" label="ID" error={errors.id} size={12} />
                            <Box mt={0.5}>
                                <SearchButton
                                    config={SEARCH_CONFIGS.ORDEN_COMPRA}
                                    onOpenSearch={ordenListSearch.openModal}
                                    variant="icon"
                                    tooltip="Buscar Orden"
                                />
                            </Box>
                        </Box>
                    </Grid>
                    <SuplidorComboBox control={control} name="suplidorId" label="Suplidor" error={errors.suplidorId} size={8} />
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                            type="button"
                            fullWidth
                            variant={estadoId === "PEN" ? "contained" : "outlined"}
                            color={estadoId === "PEN" ? "warning" : "primary"}
                            onClick={handleToggleEnviarEntrada}
                            sx={{ height: "40px", textTransform: "none", fontWeight: 700 }}>
                            {estadoId === "PEN" ? "Enviado a entrada" : "Enviar a entrada"}
                        </Button>
                    </Grid>
                </Grid>

                <Divider style={{ margin: "20px 0" }} />

                {/* Formulario para agregar detalles */}
                <Box style={{ margin: 20 }}>
                    <Accordion expanded={accordionExpanded} onChange={() => setAccordionExpanded(!accordionExpanded)}>
                        <AccordionSummary
                            expandIcon={
                                <IconButton size="small" color="primary">
                                    <AddIcon />
                                </IconButton>
                            }>
                            <Typography variant="h6">Agregar Producto</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <SearchButton
                                        config={SEARCH_CONFIGS.PRODUCTO}
                                        onOpenSearch={handleOpenProductoSearch}
                                        variant="input"
                                        label="Producto"
                                        displayValue={getDetalleProductoNombre(detalleForm)}
                                        placeholder={suplidorId ? "Seleccione un producto..." : "Seleccione un suplidor primero"}
                                        size="small"
                                        disabled={!suplidorId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Unidad"
                                        value={detalleForm.unidadId || ""}
                                        onChange={(e) => handleUnidadChange(Number(e.target.value))}
                                        size="small"
                                        disabled={unidadesDisponibles.length === 0}>
                                        {unidadesDisponibles.map((unidad: any) => (
                                            <option key={unidad.id} value={unidad.id}>
                                                {unidad.unidadNombre}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Cantidad"
                                        type="number"
                                        value={detalleForm.cantidad}
                                        onChange={(e) => handleDetalleChange("cantidad", parseFloat(e.target.value) || 0)}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Precio Unitario"
                                        type="number"
                                        value={detalleForm.precioUnitario}
                                        onChange={(e) => handleDetalleChange("precioUnitario", parseFloat(e.target.value) || 0)}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="ITBIS %"
                                        type="number"
                                        value={detalleForm.itbisProducto}
                                        onChange={(e) => handleDetalleChange("itbisProducto", parseFloat(e.target.value) || 0)}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Descuento %"
                                        type="number"
                                        value={detalleForm.descuentoPorciento}
                                        onChange={(e) =>
                                            handleDetalleChange("descuentoPorciento", parseFloat(e.target.value) || 0)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Descuento RD$"
                                        type="number"
                                        value={detalleForm.descuentoCantidad}
                                        onChange={(e) =>
                                            handleDetalleChange("descuentoCantidad", parseFloat(e.target.value) || 0)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Subtotal"
                                        value={formatCurrency(detalleForm.subTotal)}
                                        size="small"
                                        disabled
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="ITBIS"
                                        value={formatCurrency(detalleForm.itbis)}
                                        size="small"
                                        disabled
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={formatCurrency(detalleForm.total)}
                                        size="small"
                                        disabled
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddDetalle}
                                        sx={{
                                            height: "40px",
                                            backgroundColor: "#00897b",
                                            color: "#ffffff",
                                            fontWeight: 700,
                                            textTransform: "none",
                                            "&:hover": {
                                                backgroundColor: "#00695c",
                                            },
                                        }}>
                                        Agregar
                                    </Button>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Box>

                {/* Tabla de productos agregados */}
                <Box style={{ padding: 20 }}>
                    <Box
                        sx={{
                            background: "linear-gradient(90deg, #00897b 0%, #00695c 100%)",
                            color: "#ffffff",
                            px: 2,
                            py: 1.25,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                        }}>
                        Productos Agregados
                    </Box>
                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: 0,
                            boxShadow: "none",
                        }}>
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
                                    <TableCell align="right">Precio</TableCell>
                                    <TableCell align="right">Subtotal</TableCell>
                                    <TableCell align="right">ITBIS</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(detalles || []).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No hay productos agregados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (detalles || []).map((detalle: any, idx: number) => (
                                        <TableRow
                                            key={idx}
                                            sx={{
                                                opacity: isDetalleActivo(detalle) ? 1 : 0.55,
                                            }}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{getDetalleProductoNombre(detalle)}</TableCell>
                                            <TableCell align="right">
                                                {editingRowIndex === idx ? (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "flex-end",
                                                            gap: 0.5,
                                                        }}>
                                                        <TextField
                                                            type="number"
                                                            value={tempCantidad}
                                                            onChange={(e) => setTempCantidad(parseFloat(e.target.value) || 0)}
                                                            size="small"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleConfirmEdit(idx);
                                                                if (e.key === "Escape") setEditingRowIndex(null);
                                                            }}
                                                            inputProps={{ min: 0, step: 1, style: { textAlign: "right" } }}
                                                            sx={{ width: "80px" }}
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleConfirmEdit(idx)}>
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "flex-end",
                                                            gap: 0.5,
                                                        }}>
                                                        <span>{detalle.cantidad}</span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={!isDetalleActivo(detalle)}
                                                            onClick={() => handleStartEdit(idx, detalle.cantidad)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(detalle.precioUnitario)}</TableCell>
                                            <TableCell align="right">{formatCurrency(detalle.subTotal)}</TableCell>
                                            <TableCell align="right">{formatCurrency(detalle.itbis)}</TableCell>
                                            <TableCell align="right">{formatCurrency(detalle.total)}</TableCell>
                                            <TableCell align="center">
                                                {isDetalleGuardado(detalle) ? (
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <Switch
                                                            size="small"
                                                            checked={isDetalleActivo(detalle)}
                                                            onChange={() => handleToggleDetalleEstado(idx)}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleRemoveDetalle(idx)}
                                                        size="small">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <Grid size={{ xs: 12, md: 8 }} />
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <strong>Subtotal:</strong>
                                <span>{formatCurrency(totales.subTotal)}</span>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <strong>ITBIS:</strong>
                                <span>{formatCurrency(totales.itbis)}</span>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <strong>Total:</strong>
                                <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{formatCurrency(totales.total)}</span>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider style={{ margin: "20px 0" }} />

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                    <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
                </Snackbar>
            </form>

            <ConfirmationModal
                open={showConfirmModal}
                title="Confirmar guardado"
                message="¿Está seguro?"
                onConfirm={handleConfirmSave}
                onCancel={() => setShowConfirmModal(false)}
            />

            {ordenSearch.config && (
                <ModalSearch
                    open={ordenSearch.isOpen}
                    onClose={ordenSearch.closeModal}
                    onSelect={handleOrdenSelect}
                    config={ordenSearch.config}
                />
            )}

            {ordenListSearch.config && (
                <ModalSearch
                    open={ordenListSearch.isOpen}
                    onClose={ordenListSearch.closeModal}
                    onSelect={handleOrdenListSelect}
                    config={ordenListSearch.config}
                />
            )}

            {productoSearch.config && (
                <ModalSearch
                    open={productoSearch.isOpen}
                    onClose={productoSearch.closeModal}
                    onSelect={handleProductoSelect}
                    config={productoSearch.config}
                />
            )}
        </>
    );
};

export default OrdenCompraView;
