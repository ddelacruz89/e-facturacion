import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk } from "../../customers/CustomComponents";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { TipoItbis } from "../../models/facturacion";
import ActionBar from "../../customers/ActionBar";
import { saveTipoItbis, getTipoItbis } from "../../apis/TipoItbisController";
import { useEffect, useState } from "react";

export default function TipoItbisView() {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<TipoItbis>({
        defaultValues: {
            id: 0,
            nombre: '',
            itbis: 0
        }
    });
    const [tipoItbis, setTipoItbis] = useState<TipoItbis[]>([]);

    useEffect(() => {
        try {
            getTipoItbis().then((data) => setTipoItbis(data));
        } catch (error) {

        }

    }, []);

    const onSubmit: SubmitHandler<TipoItbis> = (data) => {
        try {

            saveTipoItbis(data).then((response) => {
                setValue('id', response.id);
                setValue('nombre', response.nombre);
                setValue('itbis', response.itbis);
                alert("Tipo de ITBIS guardado correctamente");
            }).catch((error) => {
                console.error("Error al guardar el tipo de ITBIS:", error);
                alert("Error al guardar el tipo de ITBIS");
            });
            if (data.id) {
                console.log("Tipo de ITBIS actualizado", data);
            } else {
                console.log("Tipo de ITBIS guardado", data);
            }
        } catch (error) {

        }
    };

    const onError = (errors: FieldErrors<TipoItbis>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue('id', 0);
        setValue('nombre', '');
        setValue('itbis', 0);
    };

    const handleOnSelect = (row: TipoItbis) => {
        setValue('id', row.id);
        setValue('nombre', row.nombre);
        setValue('itbis', row.itbis);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title='Tipo ITBIS'>
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>Nuevo</Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInputPk
                        control={control}
                        name="id"
                        label="Codigo"
                        error={errors.id}
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="nombre"
                        label="Nombre ITBIS"
                        error={errors.nombre}
                        size={4}
                    />
                    <TextInput
                        control={control}
                        name="itbis"
                        label="ITBIS (%)"
                        error={errors.itbis}
                        size={2}
                    />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={tipoItbis}
                    columns={[
                        { id: "id", label: "No." },
                        { id: "nombre", label: "Nombre" },
                        { id: "itbis", label: "ITBIS (%)" }
                    ]}
                />
            </form>
        </main>
    );
};
