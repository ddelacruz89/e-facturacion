import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk, SwitchInput } from "../../customers/CustomComponents";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { MgItbis } from "../../models/facturacion";
import ActionBar from "../../customers/ActionBar";
import { saveTipoItbis, getTipoItbis } from "../../apis/TipoItbisController";
import { useEffect, useState } from "react";

export default function TipoItbisView() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MgItbis>({
        defaultValues: {
            nombre: "",
            itbis: 0,
            activo: true,
        },
    });
    const [tipoItbis, setTipoItbis] = useState<MgItbis[]>([]);

    useEffect(() => {
        getTipoItbis()
            .then((data) => {
                // Asegurar que data sea un array válido
                setTipoItbis(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Error al cargar tipos de ITBIS:", error);
                setTipoItbis([]); // Asegurar que siempre sea un array
            });
    }, []);

    const onSubmit: SubmitHandler<MgItbis> = (data) => {
        saveTipoItbis(data)
            .then((response) => {
                setValue("id", response.id);
                setValue("empresaId", response.empresaId);
                setValue("secuencia", response.secuencia);
                setValue("nombre", response.nombre);
                setValue("itbis", response.itbis);
                setValue("usuarioReg", response.usuarioReg);
                setValue("fechaReg", response.fechaReg);
                setValue("activo", response.activo);
                alert("Tipo de ITBIS guardado correctamente");

                // Recargar la lista después de guardar
                return getTipoItbis();
            })
            .then((data) => {
                setTipoItbis(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Error al guardar el tipo de ITBIS:", error);
                alert("Error al guardar el tipo de ITBIS");
            });
    };

    const onError = (errors: FieldErrors<MgItbis>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("empresaId", undefined);
        setValue("secuencia", undefined);
        setValue("nombre", "");
        setValue("itbis", 0);
        setValue("usuarioReg", "");
        setValue("fechaReg", undefined);
        setValue("activo", true);
    };

    const handleOnSelect = (row: MgItbis) => {
        setValue("id", row.id);
        setValue("empresaId", row.empresaId);
        setValue("secuencia", row.secuencia);
        setValue("nombre", row.nombre);
        setValue("itbis", row.itbis);
        setValue("usuarioReg", row.usuarioReg);
        setValue("fechaReg", row.fechaReg);
        setValue("activo", row.activo);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Tipo ITBIS">
                    <Button variant="contained" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInputPk control={control} name="secuencia" label="Codigo" error={errors.secuencia} size={2} />
                    <SwitchInput control={control} name="activo" label="Activo" error={errors.activo} size={2} />
                </Grid>
                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInput control={control} name="nombre" label="Nombre ITBIS" error={errors.nombre} size={4} />
                    <TextInput control={control} name="itbis" label="ITBIS (%)" error={errors.itbis} size={2} />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={tipoItbis}
                    columns={[
                        { id: "secuencia", label: "No." },
                        { id: "nombre", label: "Nombre" },
                        { id: "itbis", label: "ITBIS (%)" },
                        { id: "activo", label: "Activo" },
                    ]}
                />
            </form>
        </main>
    );
}
