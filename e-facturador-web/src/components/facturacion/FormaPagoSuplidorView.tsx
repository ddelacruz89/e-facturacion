import { useEffect, useState } from "react";
import { Button, Divider, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import { SubmitHandler, useForm } from "react-hook-form";
import { TableComponent, TextInput, TextInputPk } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import {
    FormaPagoSuplidorRequest,
    getAllFormasPago,
    getFormaPagoById,
    saveFormaPago,
    updateFormaPago,
} from "../../apis/FormaPagoSuplidorController";
import { MfFacturaSuplidorFormaPago } from "../../models/facturacion/MfFacturaSuplidorPagos";

interface FormValues {
    id: number;
    formaPago: string;
    estadoId: string;
    tipoFormaPago: string;
}

const INITIAL: FormValues = {
    id: 0,
    formaPago: "",
    estadoId: "ACT",
    tipoFormaPago: "",
};

const COLUMNS = [
    { id: "id",           label: "ID"          },
    { id: "formaPago",    label: "Forma de Pago"},
    { id: "tipoFormaPago",label: "Tipo"         },
    { id: "estadoId",     label: "Estado"       },
];

export default function FormaPagoSuplidorView() {
    const { control, handleSubmit, setValue, formState: { errors } } =
        useForm<FormValues>({ defaultValues: INITIAL });

    const [rows, setRows] = useState<MfFacturaSuplidorFormaPago[]>([]);

    useEffect(() => {
        reload();
    }, []);

    const reload = () => getAllFormasPago().then(setRows);

    const handleNew = () => {
        setValue("id",           0);
        setValue("formaPago",    "");
        setValue("estadoId",     "ACT");
        setValue("tipoFormaPago","");
    };

    const handleSelect = (row: MfFacturaSuplidorFormaPago) => {
        getFormaPagoById(row.id).then((data) => {
            if (!data) return;
            setValue("id",            data.id);
            setValue("formaPago",     data.formaPago ?? "");
            setValue("estadoId",      data.estadoId ?? "ACT");
            setValue("tipoFormaPago", data.tipoFormaPago ?? "");
        });
    };

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        const payload: FormaPagoSuplidorRequest = {
            formaPago:    data.formaPago,
            estadoId:     data.estadoId,
            tipoFormaPago: data.tipoFormaPago,
        };
        try {
            if (data.id) {
                const updated = await updateFormaPago(data.id, payload);
                setValue("id", updated.id);
                alert("Forma de pago actualizada correctamente.");
            } else {
                const saved = await saveFormaPago(payload);
                setValue("id", saved.id);
                alert("Forma de pago guardada correctamente.");
            }
            reload();
        } catch {
            alert("Error al guardar la forma de pago.");
        }
    };

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Formas de Pago Suplidor">
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
                        name="formaPago"
                        label="Forma de Pago"
                        error={errors.formaPago}
                        rules={{ required: "Requerido" }}
                        size={4}
                    />
                    <TextInput
                        control={control}
                        name="tipoFormaPago"
                        label="Tipo"
                        size={2}
                    />
                    <TextInput
                        control={control}
                        name="estadoId"
                        label="Estado"
                        size={2}
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
