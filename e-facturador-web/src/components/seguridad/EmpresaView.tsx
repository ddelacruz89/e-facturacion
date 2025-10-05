import React, { useEffect } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { SgEmpresa } from "../../models/seguridad";
import { Box, Grid, Button, TextField, FormControl, InputLabel } from "@mui/material";
import { NumericInput, AlphanumericInput, MoneyInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { getEmpresa, saveEmpresa } from "../../apis/EmpresaController";
import LogoImg from "../../customers/LogoImg";

const EmpresaView = () => {
    const {
        register,
        control,
        handleSubmit,
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

    useEffect(() => {
        getEmpresa().then((data) => {
            setValue("id", data.id);
            setValue("empresa", data.empresa);
            setValue("rnc", data.rnc);
            setValue("razonSocial", data.razonSocial);
            setValue("telefono", data.telefono);
            setValue("correo", data.correo);
            setValue("direccion", data.direccion);
            setValue("logo", data.logo);
        });
    }, []);

    const onSubmit: SubmitHandler<SgEmpresa> = (data) => {
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
            .catch((error) => {
                console.error("Error al guardar los datos:", error);
                alert("Error al guardar los datos");
            });
    };

    const onError = (errors: FieldErrors<SgEmpresa>) => {
        console.log("Errores de validación:", errors);
    };

    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Empresa">
                    <Button size="small" color="primary" type="submit" onClick={() => console.log(watch())}>
                        Guardar
                    </Button>
                    <Button size="small" type="button">
                        Nuevo
                    </Button>
                </ActionBar>
                <section>
                    <>
                        <label htmlFor="file-input">
                            <LogoImg logo={watch("logo") || []} />
                        </label>
                        <div>
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
                                            const numericArray = Array.from(uint8Array);
                                            setValue("logo", numericArray);
                                        };
                                        reader.readAsArrayBuffer(file);
                                    }
                                }}
                            />
                        </div>
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
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "El tamaño mínimo es de 3 caracteres" },
                                maxLength: { value: 200, message: "El tamaño máximo es de 200 caracteres" },
                            }}
                        />

                        <AlphanumericInput
                            label="Razon Social"
                            size={6}
                            name="razonSocial"
                            control={control}
                            error={errors.empresa}
                            rules={{
                                required: "Campo requerido",
                            }}
                        />
                    </Grid>

                    <Grid container spacing={2}>
                        <AlphanumericInput
                            label="Telefono"
                            size={6}
                            name="telefono"
                            control={control}
                            error={errors.empresa}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "El tamaño mínimo es de 3 caracteres" },
                                maxLength: { value: 50, message: "El tamaño máximo es de 50 caracteres" },
                            }}
                        />
                        <AlphanumericInput
                            label="Correo"
                            type="email"
                            size={6}
                            name="correo"
                            control={control}
                            error={errors.empresa}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "El tamaño mínimo es de 3 caracteres" },
                                maxLength: { value: 50, message: "El tamaño máximo es de 50 caracteres" },
                            }}
                        />
                    </Grid>
                    {/* <Grid container spacing={2}>
                        <AlphanumericInput
                            label='Direccion'
                            size={12}
                            name="direccion"
                            control={control}
                            error={errors.empresa}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "El tamaño mínimo es de 3 caracteres" },
                                maxLength: { value: 50, message: "El tamaño máximo es de 50 caracteres" },
                            }}

                        />
                    </Grid> */}
                    <Grid container spacing={2}>
                        <AlphanumericInput
                            label="Direccion"
                            size={12}
                            name="direccion"
                            control={control}
                            error={errors.empresa}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "El tamaño mínimo es de 3 caracteres" },
                                maxLength: { value: 250, message: "El tamaño máximo es de 50 caracteres" },
                            }}
                        />
                    </Grid>
                </section>
            </Box>
        </main>
    );
};

export default EmpresaView;
