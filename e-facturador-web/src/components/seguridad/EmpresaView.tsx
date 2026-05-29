import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { SgEmpresa } from "../../models/seguridad";
import { SgSucursal } from "../../models/seguridad/SgSucursal";
import { Box, Grid, Button, Tabs, Tab, Divider } from "@mui/material";
import { NumericInput, AlphanumericInput } from "../../customers/CustomMUIComponents";
import { SwitchInput, TableComponent } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { getEmpresa, saveEmpresa } from "../../apis/EmpresaController";
import { getSucursales, saveSucursal, updateSucursal } from "../../apis/SucursalController";
import LogoImg from "../../customers/LogoImg";

type SucursalForm = {
    id?: number;
    nombre: string;
    encargado: string;
    direccion: string;
    email: string;
    activo: boolean;
};

const SUCURSAL_DEFAULTS: SucursalForm = {
    nombre: "",
    encargado: "",
    direccion: "",
    email: "",
    activo: true,
};

const EmpresaView = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [empresaId, setEmpresaId] = useState<number | undefined>();

    const {
        control,
        handleSubmit: handleSubmitEmpresa,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SgEmpresa>({
        defaultValues: {
            empresa: "",
            rnc: "",
            razonSocial: "",
            telefono: "",
            correo: "",
            direccion: "",
            logo: null,
        },
    });

    const {
        control: sucursalControl,
        handleSubmit: handleSubmitSucursal,
        setValue: setSucursalValue,
        reset: resetSucursal,
        formState: { errors: sucursalErrors },
    } = useForm<SucursalForm>({ defaultValues: SUCURSAL_DEFAULTS });

    useEffect(() => {
        getEmpresa().then((data) => {
            setEmpresaId(data.id);
            setValue("id", data.id);
            setValue("empresa", data.empresa);
            setValue("rnc", data.rnc);
            setValue("razonSocial", data.razonSocial);
            setValue("telefono", data.telefono);
            setValue("correo", data.correo);
            setValue("direccion", data.direccion);
            setValue("logo", data.logo);
        });
        getSucursales().then(setSucursales).catch(() => setSucursales([]));
    }, []);

    const onSubmitEmpresa: SubmitHandler<SgEmpresa> = (data) => {
        saveEmpresa(data)
            .then((response) => {
                setValue("empresa", response.empresa);
                setValue("rnc", response.rnc);
                setValue("razonSocial", response.razonSocial);
                setValue("telefono", response.telefono);
                setValue("correo", response.correo);
                setValue("direccion", response.direccion);
                setValue("logo", response.logo);
                alert("Datos guardados correctamente");
            })
            .catch(() => alert("Error al guardar los datos"));
    };

    const onSubmitSucursal: SubmitHandler<SucursalForm> = (data) => {
        const payload = {
            ...data,
            empresa: { id: empresaId } as any,
            estadoId: data.activo ? "ACT" : "INA",
            usuarioReg: "",
            fechaReg: new Date(),
        } as SgSucursal;

        const promise = data.id
            ? updateSucursal(data.id, payload)
            : saveSucursal(payload);

        promise
            .then(() => {
                getSucursales().then(setSucursales).catch(() => {});
                resetSucursal(SUCURSAL_DEFAULTS);
            })
            .catch(() => alert("Error al guardar la sucursal"));
    };

    const handleNuevaSucursal = () => resetSucursal(SUCURSAL_DEFAULTS);

    const handleSelectSucursal = (row: SgSucursal) => {
        setSucursalValue("id", row.id);
        setSucursalValue("nombre", row.nombre);
        setSucursalValue("encargado", row.encargado);
        setSucursalValue("direccion", row.direccion);
        setSucursalValue("email", row.email);
        setSucursalValue("activo", row.activo);
    };

    return (
        <main>
            <ActionBar title="Empresa">
                {tabIndex === 0 && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSubmitEmpresa(onSubmitEmpresa)}
                        sx={{ bgcolor: "#525C71", "&:hover": { bgcolor: "#3d4555" } }}
                    >
                        Guardar
                    </Button>
                )}
                {tabIndex === 1 && (
                    <>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSubmitSucursal(onSubmitSucursal)}
                            sx={{ bgcolor: "#525C71", "&:hover": { bgcolor: "#3d4555" } }}
                        >
                            Guardar
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleNuevaSucursal}
                            sx={{ bgcolor: "#527158", "&:hover": { bgcolor: "#3d5541" } }}
                        >
                            Nuevo
                        </Button>
                    </>
                )}
            </ActionBar>

            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ px: 2 }}>
                <Tab label="Empresa" />
                <Tab label="Sucursales" />
            </Tabs>

            {tabIndex === 0 && (
                <section>
                    <>
                        <label htmlFor="file-input">
                            <LogoImg logo={watch("logo") || []} />
                        </label>
                        <input
                            id="file-input"
                            style={{ display: "none" }}
                            type="file"
                            accept="image/*"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const uint8Array = new Uint8Array(reader.result as ArrayBuffer);
                                        setValue("logo", Array.from(uint8Array));
                                    };
                                    reader.readAsArrayBuffer(file);
                                }
                            }}
                        />
                    </>
                    <Grid container spacing={2}>
                        <NumericInput
                            label="RNC"
                            size={3}
                            name="rnc"
                            control={control}
                            error={errors.rnc}
                            rules={{
                                required: "El tamaño que debe de tener es de 9 a 11 caracteres",
                                minLength: { value: 9, message: "El tamaño que debe de tener es de 9 a 11 caracteres" },
                                maxLength: { value: 11, message: "El tamaño que debe de tener es de 9 a 11 caracteres" },
                            }}
                        />
                    </Grid>
                    <Grid container spacing={2}>
                        <AlphanumericInput
                            label="Empresa"
                            size={6}
                            name="empresa"
                            control={control}
                            error={errors.empresa}
                            rules={{ required: "Campo requerido", minLength: { value: 3 }, maxLength: { value: 200 } }}
                        />
                        <AlphanumericInput
                            label="Razon Social"
                            size={6}
                            name="razonSocial"
                            control={control}
                            error={errors.razonSocial}
                            rules={{ required: "Campo requerido" }}
                        />
                    </Grid>
                    <Grid container spacing={2}>
                        <AlphanumericInput
                            label="Telefono"
                            size={6}
                            name="telefono"
                            control={control}
                            error={errors.telefono}
                            rules={{ required: "Campo requerido", minLength: { value: 3 }, maxLength: { value: 50 } }}
                        />
                        <AlphanumericInput
                            label="Correo"
                            type="email"
                            size={6}
                            name="correo"
                            control={control}
                            error={errors.correo}
                            rules={{ required: "Campo requerido", minLength: { value: 3 }, maxLength: { value: 50 } }}
                        />
                    </Grid>
                    <Grid container spacing={2}>
                        <AlphanumericInput
                            label="Direccion"
                            size={12}
                            name="direccion"
                            control={control}
                            error={errors.direccion}
                            rules={{ required: "Campo requerido", minLength: { value: 3 }, maxLength: { value: 250 } }}
                        />
                    </Grid>
                </section>
            )}

            {tabIndex === 1 && (
                <section>
                    <Grid container spacing={2} style={{ padding: 20 }}>
                        <AlphanumericInput
                            label="Nombre"
                            size={4}
                            name="nombre"
                            control={sucursalControl}
                            error={sucursalErrors.nombre}
                            rules={{ required: "Campo requerido", maxLength: { value: 100 } }}
                        />
                        <AlphanumericInput
                            label="Encargado"
                            size={4}
                            name="encargado"
                            control={sucursalControl}
                            error={sucursalErrors.encargado}
                            rules={{ maxLength: { value: 100 } }}
                        />
                        <SwitchInput
                            control={sucursalControl}
                            name="activo"
                            label="Activo"
                            size={2}
                        />
                    </Grid>
                    <Grid container spacing={2} style={{ padding: "0 20px 20px" }}>
                        <AlphanumericInput
                            label="Correo"
                            type="email"
                            size={4}
                            name="email"
                            control={sucursalControl}
                            error={sucursalErrors.email}
                            rules={{ maxLength: { value: 100 } }}
                        />
                        <AlphanumericInput
                            label="Direccion"
                            size={8}
                            name="direccion"
                            control={sucursalControl}
                            error={sucursalErrors.direccion}
                            rules={{ maxLength: { value: 250 } }}
                        />
                    </Grid>
                    <Divider sx={{ mx: 2, mb: 1 }}>Listado de Sucursales</Divider>
                    <Box sx={{ px: 2 }}>
                        <TableComponent
                            selected={handleSelectSucursal}
                            rows={sucursales}
                            columns={[
                                { id: "id", label: "ID" },
                                { id: "nombre", label: "Nombre" },
                                { id: "encargado", label: "Encargado" },
                                { id: "email", label: "Correo" },
                                { id: "estadoId", label: "Estado" },
                                { id: "activo", label: "Activo" },
                            ]}
                        />
                    </Box>
                </section>
            )}
        </main>
    );
};

export default EmpresaView;
