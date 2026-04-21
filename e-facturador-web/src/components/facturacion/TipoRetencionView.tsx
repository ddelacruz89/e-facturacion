import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk, SwitchInput } from "../../customers/CustomComponents";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { MgRetencion } from "../../models/facturacion";
import ActionBar from "../../customers/ActionBar";
import { saveRetencion, getRetenciones } from "../../apis/GeneralController";
import { useEffect, useState } from "react";
import { TipoRetencionSelect } from "../../customers/ComboBox";

export default function TipoRetencionView() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MgRetencion>({
        defaultValues: {
            nombre: "",
            valor: 0,
            activo: true,
            tipoRetencion: 0,
        },
    });
    const [retenciones, setRetenciones] = useState<MgRetencion[]>([]);

    useEffect(() => {
        cargarRetenciones();
    }, []);

    const cargarRetenciones = () => {
        getRetenciones()
            .then((data: MgRetencion[]) => {
                setRetenciones(Array.isArray(data) ? data : []);
            })
            .catch((error: any) => {
                console.error("Error al cargar retenciones:", error);
                setRetenciones([]);
            });
    };

    const onSubmit: SubmitHandler<MgRetencion> = (data) => {
        saveRetencion(data)
            .then((response: MgRetencion) => {
                setValue("id", response.id);
                setValue("nombre", response.nombre);
                setValue("valor", response.valor);
                setValue("activo", response.activo);
                setValue("tipoRetencion", response.tipoRetencion);
                alert("Retención guardada correctamente");

                cargarRetenciones();
            })
            .catch((error: any) => {
                console.error("Error al guardar la retención:", error);
                alert("Error al guardar la retención");
            });
    };

    const onError = (errors: FieldErrors<MgRetencion>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("nombre", "");
        setValue("valor", 0);
        setValue("activo", true);
        setValue("tipoRetencion", 0);
    };

    const handleOnSelect = (row: MgRetencion) => {
        setValue("id", row.id);
        setValue("nombre", row.nombre);
        setValue("valor", row.valor);
        setValue("activo", row.activo);
        setValue("tipoRetencion", row.tipoRetencion);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Tipo Retención">
                    <Button variant="contained" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInputPk control={control} name="id" label="ID" error={errors.id as any} size={2} />
                    <SwitchInput control={control} name="activo" label="Activo" error={errors.activo as any} size={2} />
                </Grid>
                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInput control={control} name="nombre" label="Nombre Retención" error={errors.nombre as any} size={4} />
                    <TextInput control={control} name="valor" label="Valor (%)" error={errors.valor as any} size={2} />
                    <TipoRetencionSelect control={control} name="tipoRetencion" label="Tipo Retención" error={errors.tipoRetencion as any} size={2} />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={retenciones}
                    columns={[
                        { id: "id", label: "No." },
                        { id: "nombre", label: "Nombre" },
                        { id: "valor", label: "Valor (%)" },
                        { id: "activo", label: "Activo" },
                    ]}
                />
            </form>
        </main>
    );
}
