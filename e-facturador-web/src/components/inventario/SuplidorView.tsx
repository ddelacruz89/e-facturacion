import React, { useState, useEffect } from "react";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useForm, SubmitHandler } from "react-hook-form";
import { TableComponent, TextInput, TextInputPk, EmailInput, ConfirmationModal } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { InSuplidor } from "../../models/inventario";
import { getSuplidores, saveOrUpdateSuplidor, deleteSuplidor } from "../../apis/SuplidorController";
import { useSharedSuplidores } from "../../hooks/useSharedSuplidores";

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
};

export const SuplidorView: React.FC = () => {
    const { suplidores, refresh } = useSharedSuplidores();
    const [editingSuplidor, setEditingSuplidor] = useState<InSuplidor | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<InSuplidor | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<InSuplidor>({
        defaultValues: initialSuplidor,
    });

    const onSubmit: SubmitHandler<InSuplidor> = (data) => {
        setPendingData(data);
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;

        try {
            await saveOrUpdateSuplidor(pendingData);
            reset(initialSuplidor);
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
        Object.entries(suplidor).forEach(([key, value]) => {
            setValue(key as keyof InSuplidor, value);
        });
    };

    const handleClean = () => {
        reset(initialSuplidor);
        setEditingSuplidor(null);
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
                <TextInput
                    control={control}
                    name="nombre"
                    label="Nombre"
                    error={errors.nombre}
                    size={3}
                    rules={{ required: "El nombre es requerido" }}
                />
                <TextInput control={control} name="rnc" label="RNC" error={errors.rnc} size={2} />
                <TextInput control={control} name="direccion" label="Dirección" error={errors.direccion} size={6} />
            </Grid>

            <Grid container spacing={2} style={{ padding: 20 }}>
                <TextInput control={control} name="contacto1" label="Contacto Principal" error={errors.contacto1} size={4} />
                <EmailInput control={control} name="correo1" label="Correo Principal" error={errors.correo1} size={4} />
                <TextInput control={control} name="telefono1" label="Teléfono Principal" error={errors.telefono1} size={4} />
            </Grid>

            <Grid container spacing={2} style={{ padding: 20 }}>
                <TextInput control={control} name="contacto2" label="Contacto Secundario" error={errors.contacto2} size={4} />
                <EmailInput control={control} name="correo2" label="Correo Secundario" error={errors.correo2} size={4} />
                <TextInput control={control} name="telefono2" label="Teléfono Secundario" error={errors.telefono2} size={4} />
            </Grid>

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
        </form>
    );
};

export default SuplidorView;
