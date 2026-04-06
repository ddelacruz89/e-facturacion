import React, { useState, useEffect } from "react";
import { Button, Divider, Snackbar, Alert, IconButton, Box, TextField, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useForm, SubmitHandler, useFieldArray, Controller } from "react-hook-form";
import { TableComponent, TextInput, ConfirmationModal } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { InCotizacionFormDTO, InCotizacionDetalleFormDTO } from "../../models/inventario";
import { getCotizaciones, saveCotizacion, deleteCotizacion } from "../../apis/CotizacionController";
import { validateCotizacion, validateCotizacionBusinessRules } from "../../validations/cotizacionValidation";
import { formatCurrency } from "../../utils/FacturaUtils";
import CotizacionDetalleForm from "./CotizacionDetalleForm";

const prioridadOptions = [
    { id: "BAJA", nombre: "Baja" },
    { id: "MEDIA", nombre: "Media" },
    { id: "ALTA", nombre: "Alta" },
    { id: "URGENTE", nombre: "Urgente" },
];

const initialCotizacion: InCotizacionFormDTO = {
    id: undefined,
    descripcion: "",
    prioridad: "MEDIA",
    sucursalId: undefined,
    detalles: [],
};

export const CotizacionView: React.FC = () => {
    const [cotizaciones, setCotizaciones] = useState<any[]>([]);
    const [editingCotizacion, setEditingCotizacion] = useState<InCotizacionFormDTO | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<InCotizacionFormDTO | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success" | "info" | "warning">("error");

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<InCotizacionFormDTO>({
        defaultValues: initialCotizacion,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles",
    });

    const detalles = watch("detalles");

    useEffect(() => {
        loadCotizaciones();
    }, []);

    const loadCotizaciones = async () => {
        try {
            const data = await getCotizaciones();
            setCotizaciones(data);
        } catch (error) {
            console.error("Error loading cotizaciones:", error);
            setSnackbarMessage("Error al cargar cotizaciones");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    // Mostrar errores de validación de react-hook-form en snackbar
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            const errorMessage = firstError?.message || "Error de validación";
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }, [errors]);

    const onSubmit: SubmitHandler<InCotizacionFormDTO> = async (data) => {
        console.log("Data del formulario:", data);

        // Validar con Yup
        const validation = await validateCotizacion(data);

        if (!validation.isValid) {
            console.log("❌ Errores de validación:", validation.errors);
            setValidationErrors(validation.errors);

            // Mostrar primer error en snackbar
            const firstError = Object.values(validation.errors)[0];
            setSnackbarMessage(firstError);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // Validar reglas de negocio
        const businessValidation = validateCotizacionBusinessRules(data);
        if (!businessValidation.isValid) {
            console.log("❌ Errores de reglas de negocio:", businessValidation.errors);
            setSnackbarMessage(businessValidation.errors[0]);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // Limpiar errores de validación
        setValidationErrors({});

        console.log("✅ Validación exitosa");
        setPendingData(data);
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;

        try {
            await saveCotizacion(pendingData);
            reset(initialCotizacion);
            setEditingCotizacion(null);
            setPendingData(null);
            setShowConfirmModal(false);
            loadCotizaciones();
            setSnackbarMessage("Cotización guardada exitosamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error saving cotizacion:", error);
            setSnackbarMessage("Error al guardar cotización");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleCancelSave = () => {
        setPendingData(null);
        setShowConfirmModal(false);
    };

    const handleOnSelect = (cotizacion: any) => {
        setEditingCotizacion(cotizacion);
        // Set values manually to avoid type errors
        setValue("id", cotizacion.id);
        setValue("descripcion", cotizacion.descripcion);
        setValue("prioridad", cotizacion.prioridad);
        setValue("sucursalId", cotizacion.sucursalId);
        if (cotizacion.inCotizacionesDetallesCollection) {
            setValue("detalles", cotizacion.inCotizacionesDetallesCollection);
        }
    };

    const handleClean = () => {
        reset(initialCotizacion);
        setEditingCotizacion(null);
    };

    const handleAddDetalle = () => {
        const newDetalle: InCotizacionDetalleFormDTO = {
            id: undefined,
            cantidad: 1,
            cantidadTablar: 0,
            cantidadPedida: 0,
            precioVenta: 0,
            precioCompra: 0,
            subTotal: 0,
            itbisPorciento: 0,
            itbis: 0,
            total: 0,
            suplidorId: undefined,
            productoId: undefined,
        };
        append(newDetalle);
    };

    const handleRemoveDetalle = (index: number) => {
        remove(index);
    };

    const calculateTotals = () => {
        const totales = {
            subTotal: 0,
            itbis: 0,
            total: 0,
        };

        detalles?.forEach((detalle) => {
            totales.subTotal += detalle.subTotal || 0;
            totales.itbis += detalle.itbis || 0;
            totales.total += detalle.total || 0;
        });

        return totales;
    };

    const totales = calculateTotals();

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const columns = [
        { id: "id", label: "ID" },
        { id: "descripcion", label: "Descripción" },
        { id: "prioridad", label: "Prioridad" },
        { id: "fechaReg", label: "Fecha" },
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ActionBar title="Cotizaciones">
                <Button variant="contained" color="primary" type="submit">
                    Guardar
                </Button>
                <Button variant="contained" color="primary" onClick={handleClean}>
                    Nuevo
                </Button>
            </ActionBar>

            <Grid container spacing={2} style={{ padding: 20 }}>
                <TextInput control={control} name="descripcion" label="Descripción" error={errors.descripcion} size={6} />
                <Controller
                    name="prioridad"
                    control={control}
                    render={({ field }) => (
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Prioridad"
                                error={!!errors.prioridad}
                                helperText={errors.prioridad?.message}
                                size="small">
                                {prioridadOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    )}
                />
            </Grid>

            <Divider style={{ margin: "20px 0" }} />

            <Box style={{ padding: 20 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <h5>Detalles de Cotización</h5>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddDetalle}>
                        Agregar Producto
                    </Button>
                </Box>

                {fields.map((field, index) => (
                    <Box key={field.id} mb={2} p={2} border="1px solid #ddd" borderRadius={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <h6>Producto {index + 1}</h6>
                            <IconButton color="error" onClick={() => handleRemoveDetalle(index)} size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                        <CotizacionDetalleForm
                            control={control}
                            index={index}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                        />
                    </Box>
                ))}

                {fields.length === 0 && (
                    <Box textAlign="center" py={4} color="text.secondary">
                        No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                    </Box>
                )}
            </Box>

            <Divider style={{ margin: "20px 0" }} />

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

            <div style={{ padding: 20 }}>
                <h5>Lista de Cotizaciones</h5>
                <TableComponent rows={cotizaciones} columns={columns} selected={handleOnSelect} />
            </div>

            <ConfirmationModal
                open={showConfirmModal}
                title="Confirmar guardado"
                message="¿Está seguro que desea guardar esta cotización?"
                onConfirm={handleConfirmSave}
                onCancel={handleCancelSave}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </form>
    );
};

export default CotizacionView;
