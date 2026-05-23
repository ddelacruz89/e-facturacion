import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TableComponent, TextInput, TextInputPk, SwitchInput } from "../../customers/CustomComponents";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { MfSucursalItbis, MgItbis } from "../../models/facturacion";
import { ItbisComboBox } from "../../customers/ProductComboBoxes";
import ActionBar from "../../customers/ActionBar";
import { saveMfSucursalItbis, getMfSucursalItbis } from "../../apis/MfSucursalItbisController";
import { getItbisActivos } from "../../apis/ItbisController";
import { useEffect, useState } from "react";

export default function TipoItbisView() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MfSucursalItbis>({
        defaultValues: {
            nombre: "",
            itbis: 0,
            activo: true,
            mgItbisId: 0,
        },
    });
    const [tipoItbis, setTipoItbis] = useState<MgItbis[]>([]);

    useEffect(() => {
        getItbisActivos()
            .then((data: MgItbis[]) => {
                setTipoItbis(Array.isArray(data) ? data : []);
            })
            .catch((error: any) => {
                console.error("Error al cargar tipos de ITBIS:", error);
                setTipoItbis([]);
            });
    }, []);

    const onSubmit: SubmitHandler<MfSucursalItbis> = (data) => {
        saveMfSucursalItbis(data)
            .then((response: MfSucursalItbis) => {
                setValue("id", response.id);
                setValue("empresaId", response.empresaId);
                setValue("secuencia", response.secuencia);
                setValue("nombre", response.nombre);
                setValue("itbis", response.itbis);
                setValue("usuarioReg", response.usuarioReg);
                setValue("fechaReg", response.fechaReg);
                setValue("activo", response.activo);
                setValue("mgItbisId", response.mgItbisId);
                alert("Tipo de ITBIS guardado correctamente");

                return getMfSucursalItbis();
            })
            .then((data: MfSucursalItbis[]) => {
                setTipoItbis(Array.isArray(data) ? data : []);
            })
            .catch((error: any) => {
                console.error("Error al guardar el tipo de ITBIS:", error);
                alert("Error al guardar el tipo de ITBIS");
            });
    };

    const onError = (errors: FieldErrors<MfSucursalItbis>) => {
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("empresaId", 0);
        setValue("secuencia", undefined);
        setValue("nombre", "");
        setValue("itbis", 0);
        setValue("usuarioReg", "");
        setValue("fechaReg", new Date());
        setValue("activo", true);
        setValue("mgItbisId", 0);
    };

    const handleOnSelect = (row: MfSucursalItbis) => {
        setValue("id", row.id);
        setValue("empresaId", row.empresaId);
        setValue("secuencia", row.secuencia);
        setValue("nombre", row.nombre);
        setValue("itbis", row.itbis);
        setValue("usuarioReg", row.usuarioReg);
        setValue("fechaReg", row.fechaReg);
        setValue("activo", row.activo);
        setValue("mgItbisId", row.mgItbisId);
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
                    <ItbisComboBox control={control} name="mgItbisId" label="Tipo ITBIS Base" error={errors.mgItbisId} size={4} />
                </Grid>
                <Divider>Listado</Divider>
                <TableComponent
                    selected={handleOnSelect}
                    rows={tipoItbis}
                    columns={[
                        { id: "id", label: "No." },
                        { id: "nombre", label: "Nombre" },
                        { id: "itbis", label: "ITBIS (%)" },
                        { id: "mgItbisId", label: "Tipo Base" },
                        { id: "activo", label: "Activo" },
                    ]}
                />
            </form>
        </main>
    );
}
