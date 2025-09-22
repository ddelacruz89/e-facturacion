import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk } from "../../customers/CustomComponents";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { TipoComprobante } from "../../models/facturacion";
import ActionBar from "../../customers/ActionBar";
// Debes crear estos métodos en tu controlador correspondiente
import { saveTipoComprobante, getTipoComprobantes } from "../../apis/TipoComprobanteController";
import { useEffect, useState } from "react";

const TipoComprobanteView = () => {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<TipoComprobante>({
        defaultValues: {
            id: "",
            tipoComprobante: "",
            electronico: true
        }
    });
    const [tipoComprobantes, setTipoComprobantes] = useState<TipoComprobante[]>([]);

    useEffect(() => {
        getTipoComprobantes().then((data) => setTipoComprobantes(data)).catch((error) => console.error("Error fetching tipo comprobantes:", error));
    }, []);

    const onSubmit: SubmitHandler<TipoComprobante> = (data) => {
        saveTipoComprobante(data).then((response) => {
            setValue('id', response.id);
            setValue('tipoComprobante', response.tipoComprobante);
            setValue('electronico', response.electronico);
            alert("Tipo de comprobante guardado correctamente");
        }).catch((error) => {
            console.error("Error al guardar el tipo de comprobante:", error);
            alert("Error al guardar el tipo de comprobante");
        });
        if (data.id) {
            console.log("Tipo de comprobante actualizado", data);
        } else {
            console.log("Tipo de comprobante guardado", data);
        }
    };

    const onError = (errors: FieldErrors<TipoComprobante>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue('id', "");
        setValue('tipoComprobante', "");
        setValue('electronico', true);
    };

    const handleOnSelect = (row: TipoComprobante) => {
        setValue('id', row.id ?? "");
        setValue('tipoComprobante', row.tipoComprobante);
        setValue('electronico', row.electronico);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title='Tipo Comprobante'>
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>Nuevo</Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInputPk
                        control={control}
                        name="id"
                        label="Código"
                        error={errors.id}
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="tipoComprobante"
                        label="Tipo de Comprobante"
                        error={errors.tipoComprobante}
                        size={4}
                    />
                    <TextInput
                        control={control}
                        name="electronico"
                        label="Electrónico"
                        error={errors.electronico}
                        size={2}
                    />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={tipoComprobantes}
                    columns={[
                        { id: "id", label: "No." },
                        { id: "tipoComprobante", label: "Tipo Comprobante" },
                        { id: "electronico", label: "Electrónico" }
                    ]}
                />
            </form>
        </main>
    );
};

export default TipoComprobanteView;