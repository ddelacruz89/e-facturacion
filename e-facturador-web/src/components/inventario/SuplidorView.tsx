import React, { useState, useEffect } from "react";
import { Button, Divider, Snackbar, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useForm, SubmitHandler } from "react-hook-form";
import { TableComponent, TextInput, TextInputPk, EmailInput, ConfirmationModal } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { InSuplidor } from "../../models/inventario";
import { getSuplidores, saveOrUpdateSuplidor, deleteSuplidor } from "../../apis/SuplidorController";
import { useSharedSuplidores } from "../../hooks/useSharedSuplidores";
import { TipoComprobanteSelect } from "../../customers/ComboBox";
import { validateSuplidor } from "../../validations/suplidorValidation";

const initialSuplidor: InSuplidor = {
    // BaseEntityPk fields
    id: undefined,
    empresaId: undefined,
    secuencia: undefined,

    // BaseEntity fields
    usuarioReg: "",
    fechaReg: new Date(),
    activo: true,

    // InSuplidor fields
    nombre: "",
    rnc: "",
    direccion: "",
    contacto1: "",
    contacto2: "",
    telefono1: "",
    telefono2: "",
    correo1: "",
    correo2: "",
    servicio: false,
    producto: false,
    estadoId: "A", // Active status by default
    tipoComprobante: { id: "", tipoComprobante: "", electronico: false },
};

export const SuplidorView: React.FC = () => {
    const { suplidores, refresh } = useSharedSuplidores();
    const [editingSuplidor, setEditingSuplidor] = useState<InSuplidor | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<InSuplidor | null>(null);
    const [selectedTipoComprobante, setSelectedTipoComprobante] = useState<any>(null);
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
        resetField,
    } = useForm<InSuplidor>({
        defaultValues: initialSuplidor,
    });

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

    const onSubmit: SubmitHandler<InSuplidor> = async (data) => {
        const submitData = {
            ...data,
            tipoComprobante: selectedTipoComprobante
                ? { id: selectedTipoComprobante.id } // Solo enviar el ID para la relación JPA
                : data.tipoComprobante?.id
                  ? { id: data.tipoComprobante.id }
                  : data.tipoComprobante,
        } as InSuplidor;

        // Validar con Yup
        const validation = await validateSuplidor({
            ...submitData,
            tipoComprobante: selectedTipoComprobante || data.tipoComprobante,
        });

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

        // Limpiar errores de validación
        setValidationErrors({});

        console.log("✅ Validación exitosa");
        console.log("Data del formulario:", data);
        console.log("selectedTipoComprobante:", selectedTipoComprobante);
        console.log("Datos finales a enviar:", submitData);
        console.log("tipoComprobante en submitData:", JSON.stringify(submitData.tipoComprobante, null, 2));
        setPendingData(submitData);
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;

        try {
            await saveOrUpdateSuplidor(pendingData);
            reset(initialSuplidor);
            resetField("secuencia");
            setEditingSuplidor(null);
            setPendingData(null);
            setShowConfirmModal(false);
            refresh();
        } catch (error) {
            console.error("Error saving suplidor:", error);
        }
    };

    const handleCancelSave = () => {
        setPendingData(null);
        setShowConfirmModal(false);
    };

    const handleOnSelect = (suplidor: InSuplidor) => {
        setEditingSuplidor(suplidor);
        setSelectedTipoComprobante(suplidor.tipoComprobante);
        Object.entries(suplidor).forEach(([key, value]) => {
            setValue(key as keyof InSuplidor, value);
        });
    };

    const handleClean = () => {
        reset(initialSuplidor);
        resetField("secuencia");
        setEditingSuplidor(null);
        setSelectedTipoComprobante(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ActionBar title="Suplidores">
                <Button variant="contained" color="primary" type="submit">
                    Guardar
                </Button>
                <Button variant="contained" color="primary" onClick={handleClean}>
                    Nuevo
                </Button>
            </ActionBar>

            <Grid container spacing={2} style={{ padding: 20 }}>
                <TextInputPk control={control} name="secuencia" label="Codigo" error={errors.secuencia} size={1} />
                <TextInput control={control} name="nombre" label="Nombre" error={errors.nombre} size={3} />
                {selectedTipoComprobante?.id !== "43" && (
                    <TextInput control={control} name="rnc" label="RNC" error={errors.rnc} size={2} />
                )}
                <TipoComprobanteSelect
                    control={control}
                    name="tipoComprobante.id"
                    label="Tipo Comprobante"
                    error={errors.tipoComprobante?.id}
                    size={3}
                    handleGetItem={(selected) => {
                        console.log("🔄 Dropdown cambiado - nuevo tipo comprobante seleccionado:", selected);
                        setSelectedTipoComprobante(selected);
                    }}
                />
                {selectedTipoComprobante?.id !== "43" && (
                    <TextInput control={control} name="direccion" label="Dirección" error={errors.direccion} size={3} />
                )}
            </Grid>

            <Grid container spacing={2} style={{ padding: 20 }}>
                {selectedTipoComprobante?.id !== "43" && (
                    <>
                        <TextInput
                            control={control}
                            name="contacto1"
                            label="Contacto Principal"
                            error={errors.contacto1}
                            size={4}
                        />
                        <EmailInput control={control} name="correo1" label="Correo Principal" error={errors.correo1} size={4} />
                        <TextInput
                            control={control}
                            name="telefono1"
                            label="Teléfono Principal"
                            error={errors.telefono1}
                            size={4}
                        />
                    </>
                )}
            </Grid>

            {selectedTipoComprobante?.id !== "43" && (
                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInput control={control} name="contacto2" label="Contacto Secundario" error={errors.contacto2} size={4} />
                    <EmailInput control={control} name="correo2" label="Correo Secundario" error={errors.correo2} size={4} />
                    <TextInput control={control} name="telefono2" label="Teléfono Secundario" error={errors.telefono2} size={4} />
                </Grid>
            )}

            <Divider>Listado</Divider>
            <TableComponent
                selected={handleOnSelect}
                rows={suplidores}
                columns={[
                    { id: "secuencia", label: "Código" },
                    { id: "nombre", label: "Nombre" },
                    { id: "rnc", label: "RNC" },
                    { id: "direccion", label: "Dirección" },
                    { id: "contacto1", label: "Contacto" },
                    { id: "telefono1", label: "Teléfono" },
                    { id: "correo1", label: "Correo" },
                    { id: "activo", label: "Activo" },
                ]}
            />

            <ConfirmationModal
                open={showConfirmModal}
                title="Confirmar Guardado"
                message={`¿Está seguro de que desea ${editingSuplidor ? "actualizar" : "guardar"} este suplidor?`}
                confirmText="Aceptar"
                cancelText="No Aceptar"
                confirmColor="primary"
                onConfirm={handleConfirmSave}
                onCancel={handleCancelSave}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </form>
    );
};

export default SuplidorView;
