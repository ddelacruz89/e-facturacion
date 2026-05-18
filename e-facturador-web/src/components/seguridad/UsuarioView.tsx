import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Box, Grid, Button, Chip } from "@mui/material";
import { AlphanumericInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { getUsuario, saveUsuario, updateUsuario } from "../../apis/UsuarioController";
import { SgUsuario } from "../../models/seguridad";
import { ModalSearch } from "../search/ModalSearch";
import { SEARCH_CONFIGS, SearchResultItem } from "../../types/modalSearchTypes";

const defaultValues: SgUsuario = {
    username: "",
    nombre: "",
    loginEmail: "",
    password: "",
    cambioPassword: true,
};

const UsuarioView = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<SgUsuario>({ defaultValues });

    const usernameActual = watch("username");

    // ── Selección desde modal ─────────────────────────────────────────────────
    const handleSelect = async (resumen: SearchResultItem) => {
        const completo = await getUsuario(resumen.username as string);
        reset({ ...completo, password: "" }); // no cargar hash de password
        setIsNew(false);
        setSearchOpen(false);
    };

    // ── Guardar ──────────────────────────────────────────────────────────────
    const onSubmit: SubmitHandler<SgUsuario> = async (data) => {
        try {
            const saved = isNew
                ? await saveUsuario(data)
                : await updateUsuario(data.username, data);
            reset({ ...saved, password: "" });
            setIsNew(false);
            alert("Usuario guardado correctamente");
        } catch (error) {
            console.error("Error al guardar usuario:", error);
            alert("Error al guardar el usuario");
        }
    };

    const handleNuevo = () => {
        reset(defaultValues);
        setIsNew(true);
    };

    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Usuarios">
                    <Button size="small" variant="outlined" onClick={() => setSearchOpen(true)}>
                        Buscar
                    </Button>
                    <Button size="small" onClick={handleNuevo}>
                        Nuevo
                    </Button>
                    <Button size="small" color="primary" variant="contained" type="submit">
                        Guardar
                    </Button>
                </ActionBar>

                {usernameActual && (
                    <Box sx={{ px: 2, pb: 1 }}>
                        <Chip
                            label={isNew ? "Nuevo usuario" : `Editando: ${usernameActual}`}
                            color={isNew ? "default" : "primary"}
                            size="small"
                        />
                    </Box>
                )}

                <section>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        <AlphanumericInput
                            label="Username"
                            size={4}
                            name="username"
                            control={control}
                            error={errors.username}
                            disabled={!isNew}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                maxLength: { value: 20, message: "Máximo 20 caracteres" },
                            }}
                        />
                        <AlphanumericInput
                            label="Nombre completo"
                            size={8}
                            name="nombre"
                            control={control}
                            error={errors.nombre}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            }}
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ px: 2 }}>
                        <AlphanumericInput
                            label="Email de login"
                            size={6}
                            name="loginEmail"
                            control={control}
                            error={errors.loginEmail}
                        />
                        <AlphanumericInput
                            label={isNew ? "Contraseña" : "Nueva contraseña (dejar vacío para no cambiar)"}
                            size={6}
                            name="password"
                            type="password"
                            control={control}
                            error={errors.password}
                            rules={
                                isNew
                                    ? { required: "Campo requerido", minLength: { value: 6, message: "Mínimo 6 caracteres" } }
                                    : {}
                            }
                        />
                    </Grid>
                </section>
            </Box>

            {/* Modal de búsqueda */}
            <ModalSearch
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelect={handleSelect}
                config={SEARCH_CONFIGS.USUARIO}
            />
        </main>
    );
};

export default UsuarioView;
