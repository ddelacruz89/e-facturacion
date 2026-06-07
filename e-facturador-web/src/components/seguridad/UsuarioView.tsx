import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Alert,
    Box, Grid, Button, Chip, TextField, IconButton, Tooltip, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Snackbar, FormGroup, FormControlLabel, Checkbox, Typography, Divider,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { AlphanumericInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { getUsuario, saveUsuario, updateUsuario, resetearPasswordUsuario } from "../../apis/UsuarioController";
import { SgNotificacionTipoConfigDTO, SgUsuario } from "../../models/seguridad";
import { ModalSearch } from "../search/ModalSearch";
import { SEARCH_CONFIGS, SearchResultItem } from "../../types/modalSearchTypes";
import { getTodosTipos, getTiposConSuscripcion, saveSuscripciones } from "../../apis/SgNotificacionController";

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
    const [busquedaInput, setBusquedaInput] = useState("");
    const [confirmResetOpen, setConfirmResetOpen] = useState(false);
    const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null);
    const [tiposNotif, setTiposNotif] = useState<SgNotificacionTipoConfigDTO[]>([]);
    const [suscripcionesSeleccionadas, setSuscripcionesSeleccionadas] = useState<Set<string>>(new Set());
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "info" });

    const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info") =>
        setSnackbar({ open: true, message, severity });

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

    // ── Cargar catálogo de tipos de notificación ──────────────────────────────
    const cargarTiposNotif = async (username: string) => {
        try {
            const tipos = await getTiposConSuscripcion(username);
            setTiposNotif(tipos);
            setSuscripcionesSeleccionadas(new Set(tipos.filter((t) => t.suscrito).map((t) => t.tipoId)));
        } catch {
            setTiposNotif([]);
        }
    };

    // Cargar catálogo al montar (sin suscripciones para usuario nuevo)
    useEffect(() => {
        getTodosTipos()
            .then((tipos) => {
                setTiposNotif(tipos.map((t) => ({ ...t, suscrito: false })));
                setSuscripcionesSeleccionadas(new Set());
            })
            .catch(() => {});
    }, []);

    // ── Selección de usuario desde modal ─────────────────────────────────────
    const handleSelect = async (resumen: SearchResultItem) => {
        const completo = await getUsuario(resumen.username as string);
        reset({ ...completo, password: "" });
        setIsNew(false);
        setBusquedaInput("");
        setSearchOpen(false);
        await cargarTiposNotif(resumen.username as string);
    };

    // ── Selección de manager desde modal ─────────────────────────────────────
    const handleSelectManager = (resumen: SearchResultItem) => {
        // Evitar que un usuario se asigne a sí mismo como manager
        if (resumen.username === usernameActual) {
            showSnackbar("Un usuario no puede ser su propio manager.", "warning");
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
            const payload: SgUsuario = {
                ...data,
                manager: data.manager?.username ? { username: data.manager.username, nombre: data.manager.nombre } : null,
            };
            const saved = isNew
                ? await saveUsuario(payload)
                : await updateUsuario(data.username, payload);
            // Guardar suscripciones
            await saveSuscripciones(saved.username, Array.from(suscripcionesSeleccionadas));
            reset({ ...saved, password: "" });
            setIsNew(false);
            showSnackbar("Usuario guardado correctamente", "success");
        } catch (error) {
            console.error("Error al guardar usuario:", error);
            showSnackbar("Error al guardar el usuario", "error");
        }
    };

    const handleNuevo = () => {
        reset(defaultValues);
        setIsNew(true);
        setSuscripcionesSeleccionadas(new Set());
        setTiposNotif((prev) => prev.map((t) => ({ ...t, suscrito: false })));
    };

    const handleConfirmarReset = async () => {
        setConfirmResetOpen(false);
        try {
            const res = await resetearPasswordUsuario(usernameActual);
            setPasswordTemporal(res.passwordTemporal);
        } catch {
            showSnackbar("Error al resetear la contraseña", "error");
        }
    };

    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Usuarios">
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleNuevo}
                        sx={{ bgcolor: "#716752", "&:hover": { bgcolor: "#5a5241" } }}
                    >
                        Nuevo
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        type="submit"
                        sx={{ bgcolor: "#526671", "&:hover": { bgcolor: "#3d4f58" } }}
                    >
                        Guardar
                    </Button>
                </ActionBar>

                <Box sx={{ px: 2, pt: 1.5, pb: 1.5, maxWidth: 360 }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Buscar usuario…"
                        value={busquedaInput}
                        onChange={(e) => setBusquedaInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setSearchOpen(true)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Tooltip title="Buscar usuario">
                                            <IconButton size="small" onClick={() => setSearchOpen(true)} edge="start">
                                                <SearchIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

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
                        <Box sx={{ width: "50%", display: "flex", gap: 1, alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <AlphanumericInput
                                    label={isNew ? "Contraseña" : "Nueva contraseña (dejar vacío para no cambiar)"}
                                    size={12}
                                    name="password"
                                    type="password"
                                    control={control}
                                    error={errors.password}
                                    rules={{
                                        required: isNew ? "Campo requerido" : false,
                                        validate: (value: string) =>
                                            !value || value.length === 0 || value.length >= 6 || "Mínimo 6 caracteres",
                                    }}
                                />
                            </Box>
                            {!isNew && usernameActual && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => setConfirmResetOpen(true)}
                                    sx={{ bgcolor: "#715D52", "&:hover": { bgcolor: "#5a4a41" }, mt: 0.5, whiteSpace: "nowrap" }}
                                >
                                    Resetear
                                </Button>
                            )}
                        </Box>
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
                    {/* ── Acceso a tipos de aviso privilegiados ──────────────── */}
                    {tiposNotif.some((t) => t.accesoRestringido) && (
                        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                            <Divider sx={{ mb: 1.5 }} />
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Avisos con acceso restringido
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                Los tipos marcados le aparecerán a este usuario como aviso al iniciar sesión.
                                Los tipos sin marcar son recibidos por todos los usuarios.
                            </Typography>
                            <FormGroup row>
                                {tiposNotif.filter((t) => t.accesoRestringido).map((tipo) => (
                                    <FormControlLabel
                                        key={tipo.tipoId}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={suscripcionesSeleccionadas.has(tipo.tipoId)}
                                                onChange={(e) => {
                                                    setSuscripcionesSeleccionadas((prev) => {
                                                        const next = new Set(prev);
                                                        if (e.target.checked) next.add(tipo.tipoId);
                                                        else next.delete(tipo.tipoId);
                                                        return next;
                                                    });
                                                }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2">{tipo.nombre}</Typography>
                                                {tipo.descripcion && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {tipo.descripcion}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        sx={{ alignItems: "flex-start", mr: 3, mb: 0.5 }}
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    )}
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

            {/* Confirmación de reset */}
            <Dialog open={confirmResetOpen} onClose={() => setConfirmResetOpen(false)}>
                <DialogTitle>Resetear contraseña</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Se generará una contraseña temporal para <strong>{usernameActual}</strong>.
                        El usuario deberá cambiarla al próximo inicio de sesión.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmResetOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmarReset} color="warning" variant="contained">
                        Confirmar reset
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mostrar contraseña temporal */}
            <Dialog open={!!passwordTemporal} onClose={() => setPasswordTemporal(null)}>
                <DialogTitle>Contraseña temporal generada</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Entrega esta contraseña al usuario. No se mostrará de nuevo.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        size="small"
                        value={passwordTemporal ?? ""}
                        inputProps={{ readOnly: true }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Copiar">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(passwordTemporal ?? "");
                                                }}
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordTemporal(null)} variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default UsuarioView;
