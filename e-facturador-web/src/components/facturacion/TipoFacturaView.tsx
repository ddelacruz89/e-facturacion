import { Button, Typography, TextField, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk } from "../../customers/CustomComponents";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { TipoFactura } from "../../models/facturacion";
import ActionBar from "../../customers/ActionBar";
import { saveTipoFactura, getTipoFacturas } from "../../apis/TipoFacturaController";
import { useEffect, useState } from "react";
const TipoFacturaView = () => {
    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<TipoFactura>({
        defaultValues: {
            id: 0,
            nombre: ''
        }
    });
    const [tipoFacturas, setTipoFacturas] = useState<TipoFactura[]>([]);
    useEffect(() => {
        getTipoFacturas().then((data) => {
            setTipoFacturas(data);
        });

    }, []);
    const onSubmit: SubmitHandler<TipoFactura> = (data) => {
        saveTipoFactura(data).then((response) => {
            setValue('id', response.id);
            setValue('nombre', response.nombre);
            alert("Tipo de factura guardado correctamente");
        }).catch((error) => {
            console.error("Error al guardar el tipo de factura:", error);
            alert("Error al guardar el tipo de factura");
        });
        if (data.id) {
            console.log("Tipo de factura actualizado", data);
        } else {
            console.log("Tipo de factura guardado", data);
        }

    }


    const onError = (errors: FieldErrors<TipoFactura>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue('id', 0);
        setValue('nombre', '');
    }

    const handleOnSelect = (row: TipoFactura) => {
        setValue('id', row.id);
        setValue('nombre', row.nombre);
    }
    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title='Usuario'>
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>Nuevo</Button>
                    {/* <Button size='sm' color="primary" type="submit">Guardar</Button> */}
                    {/* <Button size='sm' type="button">Nuevo</Button> */}
                </ActionBar>

                <Grid container spacing={2}
                    style={{ padding: 20 }}>
                    <TextInputPk
                        control={control}
                        // readOnly={true}
                        name="id"
                        label="Codigo"
                        error={errors.nombre}
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="nombre"
                        label="Tipo de Factura"
                        error={errors.nombre}
                        size={4}
                    />
                </Grid>
                <Divider>Mas</Divider>

                <TableComponent selected={handleOnSelect} rows={tipoFacturas} columns={[{ id: "id", label: "No." }, { id: "nombre", label: "Tipo Factura" }]} />
            </form>
        </main>
    );
};

export default TipoFacturaView;