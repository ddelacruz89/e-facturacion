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
    getStockProductoEnAlmacen,
} from "../../apis/TransferenciaController";

// ── tipos internos del formulario ────────────────────────────────────────────

interface DetalleForm {
    productoId: any;
    cant: number;
    lote?: string;
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
    PEN: "warning",
    APR: "success",
    INA: "error",
};
const estadoLabel: Record<string, string> = {
    PEN: "Pendiente",
    APR: "Aprobada",
    INA: "Anulada",
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

// ── componente principal ──────────────────────────────────────────────────────

export const TransferenciaView: React.FC = () => {
    const [transferencias, setTransferencias] = useState<InTransferencia[]>([]);
    const [listLoaded, setListLoaded] = useState(false);
    const [showList, setShowList] = useState(false);

    // índice de la fila cuyo producto se está buscando
    const [activeDetalleIndex, setActiveDetalleIndex] = useState<number | null>(null);

    // stock disponible por índice de fila: { [rowIndex]: cantidad }
    const [stockMap, setStockMap] = useState<Record<number, number>>({});

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "info" });

    const productoSearch = useModalSearch();

    const { control, handleSubmit, watch, setValue, reset } = useForm<TransferenciaForm>({
        defaultValues: initialForm,
    });

    const { fields, append, remove } = useFieldArray({ control, name: "detalles" });

    // ── snackbar ──────────────────────────────────────────────────────────────

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
                lote: d.lote ?? "",
                cantidadUnidad: d.cantidadUnidad,
                unidadDescripcion: d.unidadDescripcion ?? "",
            })),
        });
        setShowList(false);
    };

    // ── búsqueda de producto por fila ─────────────────────────────────────────

    const handleOpenProductSearch = (index: number) => {
        setActiveDetalleIndex(index);
        productoSearch.openModal(SEARCH_CONFIGS.PRODUCTO);
    };

    const handleProductoSelect = productoSearch.handleSelect(async (producto: any) => {
        if (activeDetalleIndex !== null) {
            setValue(`detalles.${activeDetalleIndex}.productoId`, producto);

            // intentar obtener stock si ya hay almacén origen seleccionado
            const origenRaw = watch("origenAlmacenId");
            const origenId =
                typeof origenRaw === "object" ? origenRaw?.id ?? origenRaw?.value : origenRaw;
            const productoId = typeof producto === "object" ? producto?.id : producto;

            if (origenId && productoId) {
                try {
                    const result = await getStockProductoEnAlmacen(productoId, origenId);
                    setStockMap((prev) => ({ ...prev, [activeDetalleIndex]: result.cantidad }));
                } catch {
                    // silencioso: si falla no bloqueamos la selección
                }
            }

            setActiveDetalleIndex(null);
        }
    });

    // ── agregar detalle ───────────────────────────────────────────────────────

    const addDetalle = () => {
        append({ productoId: undefined, cant: 1, lote: "", cantidadUnidad: undefined, unidadDescripcion: "" });
    };

    // ── submit ────────────────────────────────────────────────────────────────

    const onSubmit: SubmitHandler<TransferenciaForm> = async (data) => {
        const origenId =
            typeof data.origenAlmacenId === "object"
                ? data.origenAlmacenId?.id ?? data.origenAlmacenId?.value
                : data.origenAlmacenId;
        const destinoId =
            typeof data.destinoAlmacenId === "object"
                ? data.destinoAlmacenId?.id ?? data.destinoAlmacenId?.value
                : data.destinoAlmacenId;

        if (!origenId || !destinoId) {
            showMsg("Seleccione almacén origen y destino", "warning");
            return;
        }
        if (origenId === destinoId) {
            showMsg("El almacén origen y destino no pueden ser el mismo", "warning");
            return;
        }
        if (data.detalles.length === 0) {
            showMsg("Agregue al menos un producto al detalle", "warning");
            return;
        }

        // validación de stock en frontend (usando stockMap cargado al seleccionar producto)
        for (let i = 0; i < data.detalles.length; i++) {
            const disponible = stockMap[i];
            if (disponible !== undefined && data.detalles[i].cant > disponible) {
                const nombre = nombreProducto(data.detalles[i].productoId);
                showMsg(
                    `Stock insuficiente para "${nombre}": disponible ${disponible}, solicitado ${data.detalles[i].cant}`,
                    "error"
                );
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
                lote: d.lote,
                cantidadUnidad: d.cantidadUnidad,
                unidadDescripcion: d.unidadDescripcion,
            })),
        };

        try {
            if (data.id) {
                await updateTransferencia(data.id, payload);
                showMsg("Transferencia actualizada correctamente", "success");
            } else {
                await createTransferencia(payload);
                showMsg("Transferencia creada correctamente", "success");
            }
            reset(initialForm);
            setStockMap({});
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
            {/* formulario */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Transferencia de Inventario">
                    <Button size="small" variant="contained" type="submit">
                        Guardar
                    </Button>
                    <Button size="small" variant="outlined" type="button" onClick={() => { reset(initialForm); setStockMap({}); }}>
                        Nuevo
                    </Button>
                    <Button size="small" variant="outlined" type="button" onClick={loadList}>
                        {showList ? "Ocultar lista" : "Ver transferencias"}
                    </Button>
                </ActionBar>

                {/* cabecera */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Información General
                    </Typography>
                    <Grid container spacing={2}>
                        <AlmacenComboBox
                            name="origenAlmacenId"
                            label="Almacén Origen"
                            control={control}
                            size={4}
                            rules={{ required: "Requerido" }}
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
                                        <TableCell width={110}>Disponible</TableCell>
                                        <TableCell width={100}>Cantidad</TableCell>
                                        <TableCell width={120}>Lote</TableCell>
                                        <TableCell width={120}>Cant. unidad</TableCell>
                                        <TableCell width={160}>Unidad descripción</TableCell>
                                        <TableCell width={50} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
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
                                            <TableCell>
                                                {stockMap[index] !== undefined ? (
                                                    <Chip
                                                        label={stockMap[index]}
                                                        size="small"
                                                        color={
                                                            watch(`detalles.${index}.cant`) > stockMap[index]
                                                                ? "error"
                                                                : "success"
                                                        }
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <NumericInput
                                                    label=""
                                                    name={`detalles.${index}.cant`}
                                                    control={control}
                                                    size={12}
                                                    rules={{ required: true, min: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <AlphanumericInput
                                                    label=""
                                                    name={`detalles.${index}.lote`}
                                                    control={control}
                                                    size={12}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <NumericInput
                                                    label=""
                                                    name={`detalles.${index}.cantidadUnidad`}
                                                    control={control}
                                                    size={12}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <AlphanumericInput
                                                    label=""
                                                    name={`detalles.${index}.unidadDescripcion`}
                                                    control={control}
                                                    size={12}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => remove(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>

            {/* lista de transferencias */}
            {showList && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Transferencias registradas
                    </Typography>
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
                                                {t.fechaReg
                                                    ? new Date(t.fechaReg).toLocaleDateString("es-DO")
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={() => loadIntoForm(t)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {t.estadoId !== "INA" && (
                                                    <Tooltip title="Anular">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleAnular(t.id!)}>
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
        </main>
    );
};

export default TransferenciaView;
