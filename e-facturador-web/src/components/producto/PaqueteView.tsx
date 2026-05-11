import React, { useState } from "react";
import { useForm, SubmitHandler, FieldErrors, useFieldArray } from "react-hook-form";
import {
    Box,
    Grid,
    Button,
    Typography,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    IconButton,
    Snackbar,
    Alert,
    Switch,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import { AlphanumericInput, NumericInput, MoneyInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { savePaquete, getPaquete } from "../../apis/PaqueteController";
import { getProducto } from "../../apis/ProductoController";
import { MgPaquete, MgPaqueteItem } from "../../models/producto/MgPaquete";
import { MgProductoUnidadSuplidor } from "../../models/producto";

import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";

import { ItbisComboBox } from "../../customers/ProductComboBoxes";

// ---------------------------------------------------------------------------
// Tipo auxiliar para la fila del ítem en el form (incluye datos de display)
// ---------------------------------------------------------------------------
interface PaqueteItemForm extends MgPaqueteItem {
    _productoNombre: string;
    _unidadNombre: string;
    _esServicio: boolean;
    _precioVenta?: number;
    /** Opciones de unidad cargadas del producto seleccionado */
    _unidadesDisponibles: { id: number; label: string; esServicio: boolean }[];
}

const defaultItem = (): PaqueteItemForm => ({
    activo: true,
    productoId: 0,
    unidadProductorSuplidorId: 0,
    cantidad: 1,
    _productoNombre: "",
    _unidadNombre: "",
    _esServicio: false,
    _unidadesDisponibles: [],
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatMoney = (v?: number) =>
    v == null ? "-" : Number(v).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
const PaqueteView: React.FC = () => {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<MgPaquete>({
        defaultValues: {
            activo: true,
            nombre: "",
            descripcion: "",
            codigoBarra: "",
            precioVenta: 0,
            precioMinimo: 0,
            itbisId: 0,
            notas: "",
            items: [],
        },
    });

    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
        control,
        name: "items",
    });

    const [selectedPaquete, setSelectedPaquete] = useState<MgPaquete | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: React.ReactNode;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "info" });

    // Modal de búsqueda de paquete (para cargar uno existente)
    const paqueteSearch = useModalSearch();
    // Modal de búsqueda de producto (para agregar ítems)
    const productoSearch = useModalSearch();

    // Estado temporal mientras se carga el producto para el nuevo ítem
    const [loadingProducto, setLoadingProducto] = useState(false);

    const showSnackbar = (message: React.ReactNode, severity: "success" | "error" | "warning" | "info") =>
        setSnackbar({ open: true, message, severity });

    // -----------------------------------------------------------------------
    // Clear
    // -----------------------------------------------------------------------
    const clearForm = () => {
        setSelectedPaquete(null);
        reset({
            activo: true,
            nombre: "",
            descripcion: "",
            codigoBarra: "",
            precioVenta: 0,
            precioMinimo: 0,
            itbisId: 0,
            notas: "",
            items: [],
        });
    };

    // -----------------------------------------------------------------------
    // Seleccionar paquete existente desde modal
    // -----------------------------------------------------------------------
    const handlePaqueteSelect = paqueteSearch.handleSelect(async (resumen: any) => {
        try {
            const completo = await getPaquete(resumen.id);
            // Reconstruir items con datos de display
            const itemsForm: PaqueteItemForm[] = await Promise.all(
                (completo.items || []).map(async (item) => {
                    const productoId =
                        typeof item.productoId === "object" ? (item.productoId as any).id : item.productoId;
                    const producto = await getProducto(productoId);
                    const unidadesDisponibles = buildUnidadOptions(producto.unidadProductorSuplidor || []);
                    const unidadId =
                        typeof item.unidadProductorSuplidorId === "object"
                            ? (item.unidadProductorSuplidorId as any).id
                            : item.unidadProductorSuplidorId;
                    const unidadOpt = unidadesDisponibles.find((u) => u.id === unidadId);
                    const esServicio = producto.categoriaId
                        ? (producto.categoriaId as any).inventario === false ||
                          (producto.categoriaId as any).inventario == null
                        : false;
                    return {
                        ...item,
                        _productoNombre: producto.nombreProducto,
                        _unidadNombre: unidadOpt?.label ?? "",
                        _esServicio: esServicio,
                        _precioVenta: producto.precioVenta,
                        _unidadesDisponibles: unidadesDisponibles,
                    } as PaqueteItemForm;
                })
            );
            reset({ ...completo, items: itemsForm });
            setSelectedPaquete(completo);
            showSnackbar("Paquete cargado correctamente", "success");
        } catch {
            showSnackbar("Error al cargar el paquete", "error");
        }
    });

    // -----------------------------------------------------------------------
    // Agregar ítem desde modal de producto
    // -----------------------------------------------------------------------
    const handleProductoSelect = productoSearch.handleSelect(async (resumen: any) => {
        setLoadingProducto(true);
        try {
            const producto = await getProducto(resumen.id);
            const unidades = buildUnidadOptions(producto.unidadProductorSuplidor || []);

            if (unidades.length === 0) {
                showSnackbar("Este producto no tiene unidades de venta configuradas", "warning");
                return;
            }

            const esServicio =
                (producto.categoriaId as any)?.inventario === false ||
                (producto.categoriaId as any)?.inventario == null;

            const primeraUnidad = unidades[0];

            appendItem({
                ...defaultItem(),
                productoId: resumen.id,
                unidadProductorSuplidorId: primeraUnidad.id,
                cantidad: 1,
                _productoNombre: producto.nombreProducto,
                _unidadNombre: primeraUnidad.label,
                _esServicio: esServicio,
                _precioVenta: producto.precioVenta,
                _unidadesDisponibles: unidades,
            } as PaqueteItemForm);
        } catch {
            showSnackbar("Error al cargar el producto", "error");
        } finally {
            setLoadingProducto(false);
        }
    });

    // -----------------------------------------------------------------------
    // Construir opciones de unidad a partir de MgProductoUnidadSuplidor[]
    // -----------------------------------------------------------------------
    const buildUnidadOptions = (
        unidades: MgProductoUnidadSuplidor[],
    ): { id: number; label: string; esServicio: boolean }[] =>
        unidades
            .filter((u) => u.activo && u.disponibleEnVenta)
            .map((u) => {
                const base = (u.unidadId as any)?.nombre ?? `Unidad ${u.id}`;
                const fraccion = (u.unidadFraccionId as any)?.nombre;
                const label = fraccion ? `${u.cantidad} ${base} / ${fraccion}` : base;
                return { id: u.id!, label, esServicio: false };
            });

    // -----------------------------------------------------------------------
    // Submit
    // -----------------------------------------------------------------------
    const onSubmit: SubmitHandler<MgPaquete> = async (data) => {
        // Validaciones básicas
        if (!data.nombre?.trim()) {
            showSnackbar("El nombre del paquete es requerido", "error");
            return;
        }
        if (!data.precioVenta || Number(data.precioVenta) <= 0) {
            showSnackbar("El precio de venta debe ser mayor a cero", "error");
            return;
        }
        if (!data.items || data.items.length === 0) {
            showSnackbar("El paquete debe tener al menos un ítem", "error");
            return;
        }

        // Validar que el precio del paquete no sea menor a la suma de los precios individuales
        const precioVenta = Number(data.precioVenta);
        const itemsActivos = (data.items as PaqueteItemForm[]).filter((i) => i.activo);
        const sumaItems = itemsActivos.reduce(
            (acc, i) => acc + (i._precioVenta != null ? Number(i._precioVenta) * Number(i.cantidad || 1) : 0),
            0
        );
        if (sumaItems > precioVenta) {
            showSnackbar(
                <span>
                    El precio del paquete ({formatMoney(precioVenta)}) no puede ser menor a la suma
                    de los ítems ({formatMoney(sumaItems)}).
                    <br />
                    {itemsActivos.filter((i) => i._precioVenta != null).map((i) => (
                        <span key={i._productoNombre} style={{ display: "block", paddingLeft: 8 }}>
                            • {i._productoNombre} × {i.cantidad} = {formatMoney(Number(i._precioVenta) * Number(i.cantidad || 1))}
                        </span>
                    ))}
                </span>,
                "error"
            );
            return;
        }

        // Limpiar campos internos (_) antes de enviar
        const payload: MgPaquete = {
            ...data,
            itbisId:
                typeof data.itbisId === "object" && data.itbisId !== null
                    ? (data.itbisId as any)
                    : data.itbisId,
            items: data.items.map((item: any) => ({
                id: item.id,
                empresaId: item.empresaId,
                usuarioReg: item.usuarioReg,
                fechaReg: item.fechaReg,
                activo: item.activo,
                productoId: typeof item.productoId === "object" ? (item.productoId as any).id ?? item.productoId : item.productoId,
                unidadProductorSuplidorId:
                    typeof item.unidadProductorSuplidorId === "object"
                        ? (item.unidadProductorSuplidorId as any).id ?? item.unidadProductorSuplidorId
                        : item.unidadProductorSuplidorId,
                cantidad: item.cantidad,
                precioRef: item.precioRef,
                notas: item.notas,
            })),
        };

        try {
            const response = await savePaquete(payload);
            const isUpdate = !!data.id;
            showSnackbar(isUpdate ? "Paquete actualizado correctamente" : "Paquete creado correctamente", "success");
            setSelectedPaquete(response);
            if (response.id) setValue("id", response.id);
            if (response.secuencia) setValue("secuencia", response.secuencia);
            if (response.fechaReg) setValue("fechaReg", response.fechaReg);
        } catch {
            showSnackbar("Error al guardar el paquete", "error");
        }
    };

    const onError = (errs: FieldErrors<MgPaquete>) => console.log("Form errors:", errs);

    const items = watch("items") as PaqueteItemForm[];

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Paquete">
                    <Button
                        size="small"
                        sx={{ color: "white", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
                        type="submit">
                        Guardar
                    </Button>
                    <Button
                        size="small"
                        sx={{ color: "white", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
                        type="button"
                        onClick={clearForm}>
                        Nuevo
                    </Button>
                </ActionBar>

                {/* ---------------------------------------------------------------- */}
                {/* Información básica del paquete                                   */}
                {/* ---------------------------------------------------------------- */}
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Información del Paquete
                        </Typography>

                        {/* Búsqueda de paquete existente */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Box sx={{ width: `${(3 / 12) * 100}%` }}>
                                <SearchButton
                                    config={SEARCH_CONFIGS.PAQUETE}
                                    onOpenSearch={paqueteSearch.openModal}
                                    variant="input"
                                    size="small"
                                    label="Buscar Paquete"
                                    displayValue={selectedPaquete?.id ?? ""}
                                    placeholder="Seleccione un paquete..."
                                />
                            </Box>
                            <AlphanumericInput
                                label="Código de Barra"
                                size={3}
                                name="codigoBarra"
                                control={control}
                                error={errors.codigoBarra}
                            />
                            <AlphanumericInput
                                label="Nombre del Paquete"
                                size={6}
                                name="nombre"
                                control={control}
                                error={errors.nombre}
                                rules={{ required: "Campo requerido", minLength: { value: 3, message: "Mínimo 3 caracteres" } }}
                            />
                        </Grid>

                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <AlphanumericInput
                                label="Descripción"
                                size={12}
                                name="descripcion"
                                control={control}
                                error={errors.descripcion}
                            />
                        </Grid>

                        {/* Precios e ITBIS */}
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                            Precio e ITBIS
                        </Typography>
                        <Grid container spacing={2}>
                            <MoneyInput
                                label="Precio de Venta"
                                name="precioVenta"
                                control={control}
                                error={errors.precioVenta}
                                size={3}
                                rules={{ required: "Requerido" }}
                            />
                            <MoneyInput
                                label="Precio Mínimo"
                                name="precioMinimo"
                                control={control}
                                error={errors.precioMinimo}
                                size={3}
                            />
                            <ItbisComboBox
                                name="itbisId"
                                control={control}
                                error={errors.itbisId as any}
                                rules={{ required: "Seleccione un ITBIS" }}
                                size={3}
                            />
                        </Grid>

                        {/* Notas y estado */}
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <AlphanumericInput
                                label="Notas"
                                size={10}
                                name="notas"
                                control={control}
                                error={errors.notas}
                            />
                        </Grid>
                        <Box sx={{ mt: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={watch("activo")}
                                        onChange={(e) => setValue("activo", e.target.checked)}
                                    />
                                }
                                label="Activo"
                            />
                        </Box>
                    </CardContent>
                </Card>

                {/* ---------------------------------------------------------------- */}
                {/* Ítems del paquete                                                */}
                {/* ---------------------------------------------------------------- */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6">
                                Ítems del Paquete ({itemFields.length})
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                disabled={loadingProducto}
                                onClick={() => productoSearch.openModal(SEARCH_CONFIGS.PRODUCTO)}>
                                {loadingProducto ? "Cargando..." : "Agregar Producto / Servicio"}
                            </Button>
                        </Box>

                        {itemFields.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: "center",
                                    py: 6,
                                    border: "2px dashed",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    color: "text.secondary",
                                }}>
                                <Typography variant="body1">
                                    No hay ítems agregados aún.
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    Usa "Agregar Producto / Servicio" para construir el paquete.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: "grey.50" }}>
                                            <TableCell width="4%">#</TableCell>
                                            <TableCell width="5%">Tipo</TableCell>
                                            <TableCell width="25%">Producto / Servicio</TableCell>
                                            <TableCell width="24%">Unidad</TableCell>
                                            <TableCell width="10%">Cantidad</TableCell>
                                            <TableCell width="13%" align="right">Precio Venta</TableCell>
                                            <TableCell width="10%">Activo</TableCell>
                                            <TableCell width="9%"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {itemFields.map((field, index) => {
                                            const item = items[index] as PaqueteItemForm;
                                            const esServicio = item?._esServicio ?? false;
                                            const unidades = item?._unidadesDisponibles ?? [];
                                            const isActive = watch(`items.${index}.activo`);

                                            return (
                                                <TableRow
                                                    key={field.id}
                                                    sx={{
                                                        opacity: isActive ? 1 : 0.5,
                                                        backgroundColor: isActive ? "inherit" : "grey.50",
                                                    }}>
                                                    {/* # */}
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {index + 1}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Tipo: producto o servicio */}
                                                    <TableCell>
                                                        <Tooltip title={esServicio ? "Servicio" : "Producto"}>
                                                            {esServicio ? (
                                                                <BuildIcon fontSize="small" color="action" />
                                                            ) : (
                                                                <InventoryIcon fontSize="small" color="primary" />
                                                            )}
                                                        </Tooltip>
                                                    </TableCell>

                                                    {/* Nombre del producto */}
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {item?._productoNombre || "—"}
                                                        </Typography>
                                                        {esServicio && (
                                                            <Chip label="Servicio" size="small" variant="outlined" color="info" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />
                                                        )}
                                                    </TableCell>

                                                    {/* Selector de unidad */}
                                                    <TableCell>
                                                        <FormControl size="small" fullWidth disabled={!isActive}>
                                                            <Select
                                                                value={
                                                                    typeof watch(`items.${index}.unidadProductorSuplidorId`) === "object"
                                                                        ? (watch(`items.${index}.unidadProductorSuplidorId`) as any)?.id ?? 0
                                                                        : watch(`items.${index}.unidadProductorSuplidorId`) ?? 0
                                                                }
                                                                onChange={(e) => {
                                                                    const selected = unidades.find((u) => u.id === Number(e.target.value));
                                                                    setValue(`items.${index}.unidadProductorSuplidorId`, Number(e.target.value));
                                                                    if (selected) {
                                                                        // Actualizar label de display
                                                                        const current = watch(`items.${index}`) as PaqueteItemForm;
                                                                        setValue(`items.${index}` as any, {
                                                                            ...current,
                                                                            _unidadNombre: selected.label,
                                                                        });
                                                                    }
                                                                }}
                                                                displayEmpty>
                                                                {unidades.length === 0 && (
                                                                    <MenuItem value={0} disabled>
                                                                        Sin unidades
                                                                    </MenuItem>
                                                                )}
                                                                {unidades.map((u) => (
                                                                    <MenuItem key={u.id} value={u.id}>
                                                                        {u.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>

                                                    {/* Cantidad */}
                                                    <TableCell>
                                                        <NumericInput
                                                            label=""
                                                            name={`items.${index}.cantidad`}
                                                            control={control}
                                                            size={12}
                                                            disabled={esServicio || !isActive}
                                                        />
                                                    </TableCell>

                                                    {/* Precio de venta del producto */}
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                                                            {formatMoney(item?._precioVenta)}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Switch activo */}
                                                    <TableCell>
                                                        <Switch
                                                            size="small"
                                                            checked={watch(`items.${index}.activo`)}
                                                            onChange={(e) => setValue(`items.${index}.activo`, e.target.checked)}
                                                        />
                                                    </TableCell>

                                                    {/* Eliminar (solo si no tiene ID guardado) */}
                                                    <TableCell>
                                                        {!watch(`items.${index}.id`) && (
                                                            <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Resumen de precio */}
                        {itemFields.length > 0 && (
                            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                                <Typography variant="body2" color="text.secondary">
                                    Precio del paquete:&nbsp;
                                    <Typography component="span" variant="body1" fontWeight="bold" color="primary.main">
                                        {formatMoney(watch("precioVenta"))}
                                    </Typography>
                                    &nbsp;·&nbsp;{items.filter((i) => i.activo).length} ítem(s) activo(s)
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Modal: búsqueda de paquete existente */}
            {paqueteSearch.config && (
                <ModalSearch
                    open={paqueteSearch.isOpen}
                    onClose={paqueteSearch.closeModal}
                    onSelect={handlePaqueteSelect}
                    config={paqueteSearch.config}
                    initialValues={paqueteSearch.initialValues}
                />
            )}

            {/* Modal: búsqueda de producto/servicio para agregar al paquete */}
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
                <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default PaqueteView;
