import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Box, Grid, Button, Chip, TextField, IconButton, Tooltip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
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
    manager: null,
};

const UsuarioView = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [managerSearchOpen, setManagerSearchOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SgUsuario>({ defaultValues });

    const usernameActual = watch("username");
    const managerActual = watch("manager");

    // ── Selección de usuario desde modal ─────────────────────────────────────
    const handleSelect = async (resumen: SearchResultItem) => {
        const completo = await getUsuario(resumen.username as string);
        reset({ ...completo, password: "" }); // no cargar hash de password
        setIsNew(false);
        setSearchOpen(false);
    };

    // ── Selección de manager desde modal ─────────────────────────────────────
    const handleSelectManager = (resumen: SearchResultItem) => {
        // Evitar que un usuario se asigne a sí mismo como manager
        if (resumen.username === usernameActual) {
            alert("Un usuario no puede ser su propio manager.");
            return;
        }
        setValue("manager", { username: resumen.username as string, nombre: resumen.nombre as string });
        setManagerSearchOpen(false);
    };

    const handleLimpiarManager = () => {
        setValue("manager", null);
    };

    // ── Guardar ──────────────────────────────────────────────────────────────
    const onSubmit: SubmitHandler<SgUsuario> = async (data) => {
        try {
            // Enviar manager solo con username (el backend resuelve la entidad completa)
            const payload: SgUsuario = {
                ...data,
                manager: data.manager?.username ? { username: data.manager.username, nombre: data.manager.nombre } : null,
            };
            const saved = isNew
                ? await saveUsuario(payload)
                : await updateUsuario(data.username, payload);
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

                    {/* ── Selector de Manager ─────────────────────────────── */}
                    <Grid container spacing={2} sx={{ px: 2, pt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <TextField
                                    label="Manager"
                                    size="small"
                                    fullWidth
                                    value={managerActual ? `${managerActual.nombre} (${managerActual.username})` : ""}
                                    placeholder="Sin manager asignado"
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: managerActual ? (
                                            <Tooltip title="Quitar manager">
                                                <IconButton size="small" onClick={handleLimpiarManager}>
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : null,
                                    }}
                                    sx={{ "& .MuiInputBase-input": { cursor: "default" } }}
                                />
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setManagerSearchOpen(true)}
                                    sx={{ whiteSpace: "nowrap", minWidth: 120 }}
                                >
                                    Seleccionar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </section>
            </Box>

            {/* Modal búsqueda de usuario */}
            <ModalSearch
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelect={handleSelect}
                config={SEARCH_CONFIGS.USUARIO}
            />

            {/* Modal búsqueda de manager */}
            <ModalSearch
                open={managerSearchOpen}
                onClose={() => setManagerSearchOpen(false)}
                onSelect={handleSelectManager}
                config={SEARCH_CONFIGS.USUARIO}
            />
        </main>
    );
};

export default UsuarioView;
