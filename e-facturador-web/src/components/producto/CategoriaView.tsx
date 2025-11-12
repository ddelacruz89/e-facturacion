import { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk, SwitchInput } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { getCategorias, saveCategoria } from "../../apis/CategoriaController";
import { MgCategoria } from "../../models/producto";

const CategoriaView = () => {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MgCategoria>({
        defaultValues: {
            categoria: "",
            modificable: false,
            tieneModulo: false,
            usuarioReg: "",
            fechaReg: undefined,
            estadoId: "",
            activo: true,
        },
    });

    const [categorias, setCategorias] = useState<MgCategoria[]>([]);

    useEffect(() => {
        getCategorias().then((data) => setCategorias(data));
    }, []);

    const onSubmit: SubmitHandler<MgCategoria> = (data) => {
        saveCategoria(data)
            .then((response) => {
                setValue("secuencia", response.secuencia);
                setValue("categoria", response.categoria);
                setValue("modificable", response.modificable);
                setValue("tieneModulo", response.tieneModulo);
                setValue("activo", response.activo);
                alert("Categoría guardada correctamente");
            })
            .catch((error) => {
                console.error("Error al guardar la categoría:", error);
                alert("Error al guardar la categoría");
            });
    };

    const onError = (errors: FieldErrors<MgCategoria>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("secuencia", "");
        setValue("categoria", "");
        setValue("modificable", false);
        setValue("tieneModulo", false);
        setValue("activo", true);
        setValue("usuarioReg", "");
        setValue("fechaReg", undefined);
        setValue("estadoId", "");
    };

    const handleOnSelect = (row: MgCategoria) => {
        setValue("id", row.id);
        setValue("secuencia", row.secuencia);
        setValue("categoria", row.categoria);
        setValue("modificable", row.modificable);
        setValue("tieneModulo", row.tieneModulo);
        setValue("activo", row.activo);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Categorías de Producto">
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
                    <TextInput control={control} name="categoria" label="Nombre Categoría" error={errors.categoria} size={4} />
                    <SwitchInput control={control} name="modificable" label="Modificable" error={errors.modificable} size={2} />
                    <SwitchInput control={control} name="tieneModulo" label="Tiene Módulo" error={errors.tieneModulo} size={2} />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={categorias}
                    columns={[
                        { id: "secuencia", label: "Código" },
                        { id: "categoria", label: "Categoría" },
                        { id: "modificable", label: "Modificable" },
                        { id: "tieneModulo", label: "Tiene Módulo" },
                        { id: "activo", label: "Activo" },
                    ]}
                />
            </form>
        </main>
    );
};

export default CategoriaView;
