/**
 * UnidadView - Component for managing Units of Measure (MgUnidad)
 *
 * Features:
 * - Create, edit, and list units of measure
 * - Form validation for required fields (nombre, sigla)
 * - Automatic refresh of shared UnidadComboBox components after save
 * - Integration with useSharedUnidades hook to prevent duplicate API calls
 *
 * Usage:
 * ```tsx
 * import { UnidadView } from "../../components/producto";
 *
 * function App() {
 *   return <UnidadView />;
 * }
 * ```
 */
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, SwitchInput } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { getUnidades, saveUnidad } from "../../apis/UnidadController";
import { useSharedUnidades } from "../../hooks/useSharedUnidades";
import { MgUnidad } from "../../models/producto";

const UnidadView = () => {
    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<MgUnidad>({
        defaultValues: {
            id: undefined,  // Changed from "" to undefined since id is now number | undefined
            nombre: "",
            sigla: "", // Changed from abreviacion to sigla to match backend
            descripcion: "",
            activo: true,
        },
    });

    const [unidades, setUnidades] = useState<MgUnidad[]>([]);
    const { refresh: refreshSharedUnidades } = useSharedUnidades();

    useEffect(() => {
        loadUnidades();
    }, []);

    const loadUnidades = () => {
        getUnidades().then((data) => setUnidades(data));
    };

    const onSubmit: SubmitHandler<MgUnidad> = (data) => {
        console.log("Saving unidad:", data);
        console.log("Form data values:", {
            id: data.id,
            nombre: data.nombre,
            sigla: data.sigla, // Changed from abreviacion to sigla
            descripcion: data.descripcion,
            activo: data.activo
        });

        // Check for empty values
        if (!data.sigla || data.sigla.trim() === '') { // Changed from abreviacion to sigla
            alert("Error: La sigla no puede estar vacía");
            return;
        }

        saveUnidad(data)
            .then((response) => {
                console.log("Save response:", response);
                alert("Unidad guardada correctamente");
                loadUnidades(); // Refresh the local list
                refreshSharedUnidades(); // Refresh shared state for ComboBoxes
                reset(); // Clear the form
            })
            .catch((error: any) => {
                console.error("Error al guardar la unidad:", error);
                console.error("Error details:", error.response?.data);
                alert(`Error al guardar la unidad: ${error.response?.data?.message || error.message}`);
            });
    };

    const onError = (errors: FieldErrors<MgUnidad>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        reset();
    };

    const handleOnSelect = (row: MgUnidad) => {
        setValue("id", row.id);
        setValue("nombre", row.nombre);
        setValue("sigla", row.sigla); // Changed from abreviacion to sigla
        setValue("descripcion", row.descripcion || "");
        setValue("activo", row.activo);
        console.log("Selected row for editing:", row);
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Unidades de Medida">
                    <Button variant="contained" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <SwitchInput control={control} name="activo" label="Activo" error={errors.activo} size={2} />
                </Grid>
                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInput
                        control={control}
                        name="nombre"
                        label="Nombre"
                        error={errors.nombre}
                        size={4}
                        rules={{ required: "El nombre es requerido" }}
                    />
                    <TextInput
                        control={control}
                        name="sigla"
                        label="Sigla"
                        error={errors.sigla}
                        size={2}
                        rules={{ required: "La sigla es requerida" }}
                    />
                    <TextInput control={control} name="descripcion" label="Descripción" error={errors.descripcion} size={4} />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={unidades}
                    columns={[
                        { id: "id", label: "ID" },
                        { id: "nombre", label: "Nombre" },
                        { id: "sigla", label: "Sigla" },
                        { id: "descripcion", label: "Descripción" },
                        { id: "activo", label: "Activo" },
                    ]}
                />
            </form>
        </main>
    );
};

export default UnidadView;
