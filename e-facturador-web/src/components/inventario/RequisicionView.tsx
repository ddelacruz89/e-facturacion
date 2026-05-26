import React, { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Select,
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
import { useForm, Controller, useFieldArray, SubmitHandler } from "react-hook-form";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { useAuth } from "../../contexts/AuthContext";
import {
    InRequisicion,
    InRequisicionDetalle,
    PrioridadRequisicion,
} from "../../models/inventario/InRequisicion";
import {
    getRequisicion,
    saveRequisicion,
    updateRequisicion,
    disableRequisicion,
    enviarAprobacionRequisicion,
} from "../../apis/RequisicionController";
import { validateRequisicion } from "../../validations/requisicionValidation";
import { useSharedSucursalesActivas } from "../../apis/SucursalController";

const PRIORIDADES: { value: PrioridadRequisicion; label: string; color: "error" | "warning" | "info" }[] = [
    { value: "ALTA", label: "Alta", color: "error" },
    { value: "MEDIA", label: "Media", color: "warning" },
    { value: "BAJA", label: "Baja", color: "info" },
];

const ESTADOS: Record<string, string> = {
    PEN: "Pendiente",
    PEN_APR: "En Aprobación",
    APR: "Aprobada",
    REC: "Rechazada",
    COM: "Completada",
    ANU: "Anulada",
};

const initialRequisicion: InRequisicion = {
    almacenSolicitanteId: undefined,
    almacenOrigenId: undefined,
    prioridad: "BAJA",
    observaciones: "",
    fechaRequerida: undefined,
    detalles: [],
};

interface DetalleFormState {
    productoId?: number | { id: number; nombreProducto: string };
    cantidadSolicitada: number;
    observaciones: string;
}

const initialDetalle: DetalleFormState = {
    productoId: undefined,
    cantidadSolicitada: 1,
    observaciones: "",
};

export const RequisicionView: React.FC = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">("success");
    const [detalleForm, setDetalleForm] = useState<DetalleFormState>(initialDetalle);
    const [almacenSolicitanteDisplay, setAlmacenSolicitanteDisplay] = useState("");
    const [almacenOrigenDisplay, setAlmacenOrigenDisplay] = useState("");
    const [selectedProductoNombre, setSelectedProductoNombre] = useState("");

    const { user } = useAuth();

    const requisicionSearch = useModalSearch();
    const almacenSolicitanteSearch = useModalSearch();
    const almacenOrigenSearch = useModalSearch();
    const productoSearch = useModalSearch();

    const almacenInitialValues = { sucursalId: user?.sucursalId, estadoId: "ACT" };

    const { data: sucursales } = useSharedSucursalesActivas();

    const almacenConfig = useMemo(() => ({
        ...SEARCH_CONFIGS.ALMACEN,
        fields: SEARCH_CONFIGS.ALMACEN.fields.map((f) =>
            f.key === "sucursalId"
                ? {
                      ...f,
                      label: "Sucursal",
                      type: "select" as const,
                      placeholder: undefined,
                      options: [
                          { value: "", label: "Todas" },
                          ...(sucursales ?? []).map((s: { id?: number; nombre: string }) => ({
                              value: s.id ?? "",
                              label: s.nombre,
                          })),
                      ],
                  }
                : f
        ),
    }), [sucursales]);

    const { control, handleSubmit, reset, watch, setValue } = useForm<InRequisicion>({
        defaultValues: initialRequisicion,
    });

    const { fields, append, remove } = useFieldArray({ control, name: "detalles" });

    const currentId = watch("id");
    const currentEstado = watch("estadoId");
    const esPendiente = !currentEstado || currentEstado === "PEN";

    const showSnackbar = (msg: string, severity: "error" | "success" = "success") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleNuevo = () => {
        reset(initialRequisicion);
        setAlmacenSolicitanteDisplay("");
        setAlmacenOrigenDisplay("");
        setDetalleForm(initialDetalle);
        setSelectedProductoNombre("");
    };

    const onSubmit: SubmitHandler<InRequisicion> = async (data) => {
        const { isValid, firstError } = await validateRequisicion(data);
        if (!isValid) {
            showSnackbar(firstError, "error");
            return;
        }

        const payload: InRequisicion = {
            ...data,
            detalles: (data.detalles ?? []).map((d) => ({
                ...d,
                productoId:
                    typeof d.productoId === "object" && d.productoId !== null
                        ? (d.productoId as any).id
                        : d.productoId,
            })),
        };

        try {
            let saved: InRequisicion;
            if (payload.id) {
                saved = await updateRequisicion(payload.id, payload);
            } else {
                saved = await saveRequisicion(payload);
            }
            reset(saved);
            showSnackbar(`Requisición No. ${saved.secuencia} guardada correctamente.`);
        } catch {
            showSnackbar("Error al guardar la requisición.", "error");
        }
    };

    const handleAnular = async () => {
        if (!currentId) return;
        try {
            await disableRequisicion(currentId);
            setValue("estadoId", "ANU");
            showSnackbar("Requisición anulada.");
        } catch {
            showSnackbar("Error al anular la requisición.", "error");
        }
    };

    const handleEnviarAprobacion = async () => {
        if (!currentId) return;
        try {
            const updated = await enviarAprobacionRequisicion(currentId);
            reset(updated);
            showSnackbar(
                updated.estadoId === "APR"
                    ? "Requisición aprobada automáticamente (sin configuración de aprobación)."
                    : "Requisición enviada a aprobación."
            );
        } catch {
            showSnackbar("Error al enviar la requisición a aprobación.", "error");
        }
    };

    const buildAlmacenDisplay = (nombre: string, sucursalNombre?: string) =>
        sucursalNombre ? `${nombre} (${sucursalNombre})` : nombre;

    // Selección desde búsqueda modal
    const handleSelectRequisicion = requisicionSearch.handleSelect(async (resumen: any) => {
        const completo = await getRequisicion(resumen.id);
        reset(completo);
        setAlmacenSolicitanteDisplay(
            buildAlmacenDisplay(resumen.almacenSolicitanteNombre ?? "", resumen.almacenSolicitanteSucursal)
        );
        setAlmacenOrigenDisplay(
            buildAlmacenDisplay(resumen.almacenOrigenNombre ?? "", resumen.almacenOrigenSucursal)
        );
    });

    const handleSelectAlmacenSolicitante = almacenSolicitanteSearch.handleSelect((almacen: any) => {
        setValue("almacenSolicitanteId", almacen.id);
        setAlmacenSolicitanteDisplay(buildAlmacenDisplay(almacen.nombre, almacen.sucursalNombre));
    });

    const handleSelectAlmacenOrigen = almacenOrigenSearch.handleSelect((almacen: any) => {
        setValue("almacenOrigenId", almacen.id);
        setAlmacenOrigenDisplay(buildAlmacenDisplay(almacen.nombre, almacen.sucursalNombre));
    });

    const handleSelectProducto = productoSearch.handleSelect((producto: any) => {
        setDetalleForm((prev) => ({ ...prev, productoId: producto }));
        setSelectedProductoNombre(producto.nombreProducto ?? producto.nombre ?? "");
    });

    const handleAgregarDetalle = () => {
        if (!detalleForm.productoId) {
            showSnackbar("Seleccione un producto.", "error");
            return;
        }
        if (!detalleForm.cantidadSolicitada || detalleForm.cantidadSolicitada <= 0) {
            showSnackbar("La cantidad debe ser mayor a 0.", "error");
            return;
        }
        append({
            productoId: detalleForm.productoId,
            cantidadSolicitada: detalleForm.cantidadSolicitada,
            observaciones: detalleForm.observaciones,
        } as InRequisicionDetalle);
        setDetalleForm(initialDetalle);
        setSelectedProductoNombre("");
    };

    const resolverNombreProducto = (productoId: any): string => {
        if (!productoId) return "-";
        if (typeof productoId === "object") return productoId.nombreProducto ?? productoId.nombre ?? "-";
        return String(productoId);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Requisiciones de Transferencia">
                    <Button variant="contained" color="primary" type="submit" size="small">
                        Guardar
                    </Button>
                    <Button variant="contained" color="primary" type="button" size="small" onClick={handleNuevo}>
                        Nuevo
                    </Button>
                    {currentId && currentEstado === "PEN" && (
                        <Button variant="contained" color="secondary" type="button" size="small" onClick={handleEnviarAprobacion}>
                            Enviar a Aprobación
                        </Button>
                    )}
                    {currentId && esPendiente && (
                        <Button variant="outlined" color="error" type="button" size="small" onClick={handleAnular}>
                            Anular
                        </Button>
                    )}
                </ActionBar>

                <Box sx={{ p: 2 }}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                            <Typography variant="h6">Requisición de Transferencia</Typography>
                            {currentEstado && (
                                <Chip
                                    label={ESTADOS[currentEstado] ?? currentEstado}
                                    color={
                                        currentEstado === "APR"
                                            ? "success"
                                            : currentEstado === "PEN"
                                            ? "warning"
                                            : currentEstado === "PEN_APR"
                                            ? "info"
                                            : currentEstado === "REC"
                                            ? "error"
                                            : "default"
                                    }
                                    size="small"
                                />
                            )}
                            {watch("secuencia") && (
                                <Typography variant="body2" color="text.secondary">
                                    No. {watch("secuencia")}
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            {/* Buscar Requisición — input con botón adentro */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <SearchButton
                                    config={SEARCH_CONFIGS.REQUISICION}
                                    onOpenSearch={requisicionSearch.openModal}
                                    variant="input"
                                    label="Buscar Requisición"
                                    displayValue={watch("secuencia") ? `No. ${watch("secuencia")}` : ""}
                                    placeholder="Buscar requisición existente..."
                                />
                            </Grid>

                            {/* Almacén Solicitante */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <SearchButton
                                    config={almacenConfig}
                                    onOpenSearch={(cfg) =>
                                        almacenSolicitanteSearch.openModal(cfg, almacenInitialValues)
                                    }
                                    variant="input"
                                    label="Almacén Solicitante *"
                                    displayValue={almacenSolicitanteDisplay}
                                    placeholder="Seleccione almacén solicitante..."
                                    disabled={!esPendiente}
                                />
                            </Grid>

                            {/* Almacén Origen */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <SearchButton
                                    config={almacenConfig}
                                    onOpenSearch={(cfg) =>
                                        almacenOrigenSearch.openModal(cfg, almacenInitialValues)
                                    }
                                    variant="input"
                                    label="Almacén Origen *"
                                    displayValue={almacenOrigenDisplay}
                                    placeholder="Seleccione almacén origen..."
                                    disabled={!esPendiente}
                                />
                            </Grid>

                            {/* Prioridad */}
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Prioridad *
                                </Typography>
                                <Controller
                                    name="prioridad"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select {...field} size="small" fullWidth disabled={!esPendiente}>
                                            {PRIORIDADES.map((p) => (
                                                <MenuItem key={p.value} value={p.value}>
                                                    <Chip label={p.label} color={p.color} size="small" />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </Grid>

                            {/* Fecha requerida */}
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Fecha Requerida
                                </Typography>
                                <Controller
                                    name="fechaRequerida"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            disabled={!esPendiente}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Observaciones */}
                            <Grid size={{ xs: 12, md: 9 }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Observaciones
                                </Typography>
                                <Controller
                                    name="observaciones"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            size="small"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Observaciones generales..."
                                            disabled={!esPendiente}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Sección de detalles */}
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Productos Solicitados
                        </Typography>

                        {esPendiente && (
                            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        Producto *
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <TextField
                                            size="small"
                                            value={selectedProductoNombre}
                                            placeholder="Buscar producto..."
                                            InputProps={{ readOnly: true }}
                                            sx={{ minWidth: 220 }}
                                        />
                                        <SearchButton
                                            config={SEARCH_CONFIGS.PRODUCTO_COMPRA}
                                            onOpenSearch={productoSearch.openModal}
                                            variant="icon"
                                            tooltip="Buscar Producto"
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        Cantidad *
                                    </Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={detalleForm.cantidadSolicitada}
                                        onChange={(e) =>
                                            setDetalleForm((prev) => ({
                                                ...prev,
                                                cantidadSolicitada: Math.floor(Number(e.target.value)),
                                            }))
                                        }
                                        sx={{ width: 110 }}
                                        inputProps={{ min: 1, step: 1 }}
                                    />
                                </Box>

                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        Observación del ítem
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={detalleForm.observaciones}
                                        onChange={(e) =>
                                            setDetalleForm((prev) => ({
                                                ...prev,
                                                observaciones: e.target.value,
                                            }))
                                        }
                                        placeholder="Nota opcional..."
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAgregarDetalle}
                                    size="small"
                                    type="button"
                                >
                                    Agregar
                                </Button>
                            </Box>
                        )}

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Producto</TableCell>
                                        <TableCell align="right">Cant. Solicitada</TableCell>
                                        <TableCell align="right">Cant. Aprobada</TableCell>
                                        <TableCell>Observaciones</TableCell>
                                        {esPendiente && <TableCell align="center">Quitar</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={esPendiente ? 6 : 5}
                                                align="center"
                                                sx={{ color: "text.secondary" }}
                                            >
                                                Sin productos agregados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    {resolverNombreProducto(watch(`detalles.${index}.productoId`))}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {watch(`detalles.${index}.cantidadSolicitada`)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {watch(`detalles.${index}.cantidadAprobada`) ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {watch(`detalles.${index}.observaciones`) || "-"}
                                                </TableCell>
                                                {esPendiente && (
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </form>

            {/* Modales de búsqueda */}
            <ModalSearch
                open={requisicionSearch.isOpen}
                onClose={requisicionSearch.closeModal}
                onSelect={handleSelectRequisicion}
                config={requisicionSearch.config ?? SEARCH_CONFIGS.REQUISICION}
            />
            <ModalSearch
                open={almacenSolicitanteSearch.isOpen}
                onClose={almacenSolicitanteSearch.closeModal}
                onSelect={handleSelectAlmacenSolicitante}
                config={almacenSolicitanteSearch.config ?? SEARCH_CONFIGS.ALMACEN}
            />
            <ModalSearch
                open={almacenOrigenSearch.isOpen}
                onClose={almacenOrigenSearch.closeModal}
                onSelect={handleSelectAlmacenOrigen}
                config={almacenOrigenSearch.config ?? SEARCH_CONFIGS.ALMACEN}
            />
            <ModalSearch
                open={productoSearch.isOpen}
                onClose={productoSearch.closeModal}
                onSelect={handleSelectProducto}
                config={productoSearch.config ?? SEARCH_CONFIGS.PRODUCTO_COMPRA}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default RequisicionView;
