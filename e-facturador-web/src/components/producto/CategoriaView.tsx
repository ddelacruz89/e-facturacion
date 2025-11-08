import { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk,SwitchInput } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { getCategorias, saveCategoria } from "../../apis/CategoriaController";
import { MgCategoria } from "../../models/producto";

const CategoriaView = () => {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<MgCategoria>({
        defaultValues: {
            categoria: "",
            modificable: true,
            tieneModulo: false,
            llevaMedida: false,
            usuarioReg: "",
            fechaReg: undefined,
            estadoId: ""
        }
    });

    const [categorias, setCategorias] = useState<MgCategoria[]>([]);

    useEffect(() => {
        getCategorias().then((data) => setCategorias(data));
    }, []);

    const onSubmit: SubmitHandler<MgCategoria> = (data) => {
        saveCategoria(data).then((response) => {
            setValue('secuencia', response.secuencia);
            setValue('categoria', response.categoria);
            setValue('modificable', response.modificable);
            setValue('tieneModulo', response.tieneModulo);
            setValue('llevaMedida', response.llevaMedida);
            alert("Categoría guardada correctamente");
        }).catch((error) => {
            console.error("Error al guardar la categoría:", error);
            alert("Error al guardar la categoría");
        });
    };

    const onError = (errors: FieldErrors<MgCategoria>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue('secuencia', "");
        setValue('categoria', "");
        setValue('modificable', true);
        setValue('tieneModulo', false);
        setValue('llevaMedida', false);
        setValue('usuarioReg', "");
        setValue('fechaReg', undefined);
        setValue('estadoId', "");
    };

    const handleOnSelect = (row: MgCategoria) => {
        setValue('id', row.id);
        setValue('categoria', row.categoria);
        setValue('modificable', row.modificable);
        setValue('tieneModulo', row.tieneModulo);
        setValue('llevaMedida', row.llevaMedida);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Categorías de Producto">
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>Nuevo</Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInputPk
                        control={control}
                        name="id"
                        label="ID Categoría"
                        error={errors.id}
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="categoria"
                        label="Nombre Categoría"
                        error={errors.categoria}
                        size={4}
                    />
                    <SwitchInput
                        control={control}
                        name="modificable"
                        label="Modificable"
                        error={errors.modificable}
                        size={2}
                    />
                    <SwitchInput
                        control={control}
                        name="tieneModulo"
                        label="Tiene Módulo"
                        error={errors.tieneModulo}
                        size={2}
                    />
                    <SwitchInput
                        control={control}
                        name="llevaMedida"
                        label="Lleva Medida"
                        error={errors.llevaMedida}
                        size={2}
                    />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={categorias}
                    columns={[
                        { id: "id", label: "ID" },
                        { id: "categoria", label: "Categoría" },
                        { id: "modificable", label: "Modificable" },
                        { id: "tieneModulo", label: "Tiene Módulo" },
                        { id: "llevaMedida", label: "Lleva Medida" }
                    ]}
                />
            </form>
        </main>
    );
};

export default CategoriaView;
