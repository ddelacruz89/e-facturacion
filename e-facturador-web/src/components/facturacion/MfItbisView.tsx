import { useEffect, useState } from "react";
import { Button, Divider, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { TableComponent, TextInput, TextInputPk, NumberInput } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { getAllMfItbis, getMfItbisById, saveMfItbis, updateMfItbis } from "../../apis/MfItbisController";
import { getItbisActivos } from "../../apis/ItbisController";
import { MfItbis } from "../../models/facturacion/MfItbis";
import { MgItbis } from "../../models/facturacion";

interface FormValues {
    id: number;
    nombre: string;
    itbis: number;
    cuentaContable: string;
    mgItbisId: number;
}

const INITIAL: FormValues = {
    id: 0,
    nombre: "",
    itbis: 0,
    cuentaContable: "",
    mgItbisId: 0,
};

const COLUMNS = [
    { id: "secuencia",      label: "No."           },
    { id: "nombre",         label: "Nombre"        },
    { id: "itbis",          label: "% ITBIS"       },
    { id: "cuentaContable", label: "Cta. Contable" },
    { id: "mgItbisNombre",  label: "Tipo ITBIS"    },
];

export default function MfItbisView() {
    const { control, handleSubmit, setValue, formState: { errors } } =
        useForm<FormValues>({ defaultValues: INITIAL });

    const [rows, setRows] = useState<any[]>([]);
    const [mgItbisList, setMgItbisList] = useState<MgItbis[]>([]);

    useEffect(() => {
        reload();
        getItbisActivos().then(setMgItbisList);
    }, []);

    const reload = () =>
        getAllMfItbis().then((data) =>
            setRows(
                data.map((r) => ({
                    ...r,
                    mgItbisNombre: r.mgItbis?.nombre ?? "",
                }))
            )
        );

    const handleNew = () => {
        setValue("id",             0);
        setValue("nombre",         "");
        setValue("itbis",          0);
        setValue("cuentaContable", "");
        setValue("mgItbisId",      0);
    };

    const handleSelect = (row: any) => {
        getMfItbisById(row.id).then((data) => {
            if (!data) return;
            setValue("id",             data.id);
            setValue("nombre",         data.nombre ?? "");
            setValue("itbis",          data.itbis ?? 0);
            setValue("cuentaContable", data.cuentaContable ?? "");
            setValue("mgItbisId",      data.mgItbis?.id ?? 0);
        });
    };

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        const payload = {
            nombre:         data.nombre,
            itbis:          data.itbis,
            cuentaContable: data.cuentaContable,
            mgItbisId:      data.mgItbisId,
        };
        try {
            if (data.id) {
                const updated = await updateMfItbis(data.id, payload);
                setValue("id", updated.id);
                alert("ITBIS actualizado correctamente.");
            } else {
                const saved = await saveMfItbis(payload);
                setValue("id", saved.id);
                alert("ITBIS guardado correctamente.");
            }
            reload();
        } catch {
            alert("Error al guardar el ITBIS.");
        }
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="ITBIS por Empresa">
                    <Button variant="contained" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button variant="outlined" type="button" onClick={handleNew}>
                        Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <TextInputPk
                        control={control}
                        readOnly
                        name="id"
                        label="ID"
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="nombre"
                        label="Nombre"
                        error={errors.nombre}
                        rules={{ required: "Requerido" }}
                        size={4}
                    />
                    <NumberInput
                        control={control}
                        name="itbis"
                        label="% ITBIS"
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="cuentaContable"
                        label="Cuenta Contable"
                        size={3}
                    />
                    <Controller
                        name="mgItbisId"
                        control={control}
                        rules={{ required: "Requerido", min: { value: 1, message: "Requerido" } }}
                        render={({ field }) => (
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    size="small"
                                    label="Tipo ITBIS"
                                    error={!!errors.mgItbisId}
                                    helperText={errors.mgItbisId?.message}
                                >
                                    <MenuItem value={0} disabled>Seleccione...</MenuItem>
                                    {mgItbisList.map((m) => (
                                        <MenuItem key={m.id} value={m.id}>
                                            {m.nombre}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}
                    />
                </Grid>

                <Divider />

                <TableComponent
                    selected={handleSelect}
                    rows={rows}
                    columns={COLUMNS}
                />
            </form>
        </main>
    );
}
