import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, IconButton, InputAdornment, List,
    ListItemButton, ListItemText, Paper, TextField, Typography,
} from "@mui/material";
import {
    AccountCircle, ArrowBack, ArrowForward, Business, CheckCircleOutline,
    Lock, MarkEmailRead, Visibility, VisibilityOff,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest } from "../../models/auth";
import { AuthService } from "../../services/authService";

interface LoginFormData {
    username: string;
    password: string;
}

const LoginView: React.FC = () => {
    const { login, selectSucursal, pendingAuth, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // ── recuperar contraseña ───────────────────────────────────────────────────
    // paso: 0=cerrado 1=email 2=código+nueva 3=éxito
    const [rpPaso, setRpPaso] = useState(0);
    const [rpEmail, setRpEmail] = useState("");
    const [rpCodigo, setRpCodigo] = useState("");
    const [rpNueva, setRpNueva] = useState("");
    const [rpConfirm, setRpConfirm] = useState("");
    const [rpError, setRpError] = useState<string | null>(null);
    const [rpCargando, setRpCargando] = useState(false);
    const [rpMostrarNueva, setRpMostrarNueva] = useState(false);
    const [rpMostrarConfirm, setRpMostrarConfirm] = useState(false);
    const [rpSegundos, setRpSegundos] = useState(0);
    const rpIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Inicia el contador de 15 min cuando el usuario llega al paso 2
    useEffect(() => {
        if (rpPaso === 2) {
            setRpSegundos(15 * 60);
            rpIntervalRef.current = setInterval(() => {
                setRpSegundos((s) => {
                    if (s <= 1) {
                        clearInterval(rpIntervalRef.current!);
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            if (rpIntervalRef.current) clearInterval(rpIntervalRef.current);
        }
        return () => { if (rpIntervalRef.current) clearInterval(rpIntervalRef.current); };
    }, [rpPaso]);

    const rpMinutos = String(Math.floor(rpSegundos / 60)).padStart(2, "0");
    const rpSegs = String(rpSegundos % 60).padStart(2, "0");
    const rpExpirado = rpPaso === 2 && rpSegundos === 0;

    const abrirRecuperacion = () => {
        setRpEmail(""); setRpCodigo(""); setRpNueva(""); setRpConfirm("");
        setRpError(null); setRpPaso(1);
    };

    const cerrarRecuperacion = () => { if (!rpCargando) setRpPaso(0); };

    const handleSolicitarCodigo = async () => {
        if (!rpEmail.trim()) { setRpError("Ingrese su correo electrónico."); return; }
        setRpError(null); setRpCargando(true);
        try {
            await AuthService.solicitarRecuperacion(rpEmail.trim());
            setRpPaso(2);
        } catch {
            setRpError("Error al enviar el código. Intente nuevamente.");
        } finally { setRpCargando(false); }
    };

    const handleVerificarCodigo = async () => {
        if (!rpCodigo.trim()) { setRpError("Ingrese el código recibido."); return; }
        if (!rpNueva || rpNueva.length < 6) { setRpError("La nueva contraseña debe tener al menos 6 caracteres."); return; }
        if (rpNueva !== rpConfirm) { setRpError("Las contraseñas no coinciden."); return; }
        setRpError(null); setRpCargando(true);
        try {
            await AuthService.verificarRecuperacion(rpEmail.trim(), rpCodigo.trim(), rpNueva);
            setRpPaso(3);
        } catch (err: any) {
            const msg = err?.response?.data ?? err?.message ?? "Código inválido o expirado.";
            setRpError(typeof msg === "string" ? msg : "Código inválido o expirado.");
        } finally { setRpCargando(false); }
    };

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoginError(null);
            await login({ username: data.username, password: data.password });
        } catch (error: any) {
            setLoginError(error.message || "Error durante el login");
        }
    };

    const handleSelectSucursal = async (sucursalId: number) => {
        try {
            setLoginError(null);
            await selectSucursal(sucursalId);
        } catch (error: any) {
            setLoginError(error.message || "Error al seleccionar sucursal");
        }
    };

    // ── Paso 2: selector de sucursal ──────────────────────────────────────────
    if (pendingAuth) {
        return (
            <Container component="main" maxWidth="sm">
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                        py: 4,
                    }}>
                    <Paper elevation={8} sx={{ padding: 4, width: "100%", maxWidth: 440, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Business sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
                            <Typography component="h1" variant="h5" fontWeight="bold">
                                Seleccionar Sucursal
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Bienvenido, <strong>{pendingAuth.username}</strong>. Elige la sucursal a la que deseas conectarte:
                        </Typography>

                        {(error || loginError) && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error || loginError}
                            </Alert>
                        )}

                        <List disablePadding>
                            {pendingAuth.sucursales.map((s, idx) => (
                                <React.Fragment key={s.sucursalId}>
                                    {idx > 0 && <Divider />}
                                    <ListItemButton
                                        onClick={() => handleSelectSucursal(s.sucursalId)}
                                        disabled={isLoading}
                                        sx={{ borderRadius: 1, py: 1.5 }}>
                                        <ListItemText
                                            primary={<Typography fontWeight={600}>{s.sucursalNombre}</Typography>}
                                            secondary={s.empresaNombre}
                                        />
                                        {isLoading && <CircularProgress size={20} />}
                                    </ListItemButton>
                                </React.Fragment>
                            ))}
                        </List>

                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => window.location.reload()}
                            size="small"
                            sx={{ mt: 2 }}
                            color="inherit">
                            Volver al login
                        </Button>
                    </Paper>
                </Box>
            </Container>
        );
    }

    // ── Paso 1: formulario de credenciales ────────────────────────────────────
    return (
        <>
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    py: 4,
                }}>
                <Paper
                    elevation={8}
                    sx={{ padding: 4, width: "100%", maxWidth: 400, borderRadius: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                            }}>
                            <AccountCircle sx={{ fontSize: 40, color: "white" }} />
                        </Box>
                        <Typography component="h1" variant="h4" fontWeight="bold">
                            Iniciar Sesión
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Ingrese sus credenciales para acceder al sistema
                        </Typography>
                    </Box>

                    {(error || loginError) && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error || loginError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Controller
                            name="username"
                            control={control}
                            rules={{
                                required: "El nombre de usuario es requerido",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Usuario"
                                    margin="normal"
                                    autoComplete="username"
                                    autoFocus
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                    disabled={isLoading || isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircle color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={{
                                required: "La contraseña es requerida",
                                minLength: { value: 6, message: "Mínimo 6 caracteres" },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Contraseña"
                                    type={showPassword ? "text" : "password"}
                                    margin="normal"
                                    autoComplete="current-password"
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    disabled={isLoading || isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading || isSubmitting}
                            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}
                            startIcon={
                                (isLoading || isSubmitting) && <CircularProgress size={20} color="inherit" />
                            }>
                            {isLoading || isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </Button>

                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                ¿Olvidó su contraseña?{" "}
                                <Button variant="text" size="small" onClick={abrirRecuperacion}>
                                    Recuperar contraseña
                                </Button>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                        © 2025 Sistema de e-Facturación. Todos los derechos reservados.
                    </Typography>
                </Box>
            </Box>
        </Container>

        {/* ── Modal recuperar contraseña ─────────────────────────────────── */}
        <Dialog open={rpPaso > 0} onClose={cerrarRecuperacion} maxWidth="xs" fullWidth>

            {/* Paso 1 — Email */}
            {rpPaso === 1 && (
                <>
                    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MarkEmailRead color="primary" />
                        Recuperar contraseña
                    </DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                        <Typography variant="body2" color="text.secondary">
                            Ingrese el correo electrónico asociado a su cuenta. Le enviaremos un código de 6 dígitos válido por 15 minutos.
                        </Typography>
                        {rpError && <Alert severity="error">{rpError}</Alert>}
                        <TextField
                            label="Correo electrónico"
                            type="email"
                            value={rpEmail}
                            onChange={(e) => setRpEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSolicitarCodigo()}
                            size="small"
                            fullWidth
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cerrarRecuperacion} disabled={rpCargando}>Cancelar</Button>
                        <Button
                            variant="contained"
                            endIcon={rpCargando ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
                            onClick={handleSolicitarCodigo}
                            disabled={rpCargando}
                        >
                            Enviar código
                        </Button>
                    </DialogActions>
                </>
            )}

            {/* Paso 2 — Código + nueva contraseña */}
            {rpPaso === 2 && (
                <>
                    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Lock color="primary" />
                            Ingrese su código
                        </Box>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            color={rpExpirado ? "error" : rpSegundos <= 60 ? "warning.main" : "text.secondary"}
                            sx={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {rpExpirado ? "Código expirado" : `${rpMinutos}:${rpSegs}`}
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                        <Typography variant="body2" color="text.secondary">
                            Revise su bandeja de entrada en <strong>{rpEmail}</strong> e ingrese el código recibido junto con su nueva contraseña.
                        </Typography>
                        {rpExpirado && (
                            <Alert severity="warning">
                                El código expiró. Solicite uno nuevo.
                            </Alert>
                        )}
                        {!rpExpirado && rpError && <Alert severity="error">{rpError}</Alert>}
                        <TextField
                            label="Código de 6 dígitos"
                            value={rpCodigo}
                            onChange={(e) => setRpCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            size="small"
                            fullWidth
                            disabled={rpExpirado}
                            inputProps={{ maxLength: 6, style: { letterSpacing: "0.4em", fontSize: "1.3rem", textAlign: "center" } }}
                            autoFocus
                        />
                        <TextField
                            label="Nueva contraseña"
                            type={rpMostrarNueva ? "text" : "password"}
                            value={rpNueva}
                            onChange={(e) => setRpNueva(e.target.value)}
                            size="small"
                            fullWidth
                            disabled={rpExpirado}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setRpMostrarNueva((v) => !v)}>
                                            {rpMostrarNueva ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Confirmar nueva contraseña"
                            type={rpMostrarConfirm ? "text" : "password"}
                            value={rpConfirm}
                            onChange={(e) => setRpConfirm(e.target.value)}
                            size="small"
                            fullWidth
                            disabled={rpExpirado}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setRpMostrarConfirm((v) => !v)}>
                                            {rpMostrarConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => { setRpPaso(1); setRpError(null); }}
                            startIcon={<ArrowBack />}
                            sx={{ alignSelf: "flex-start" }}
                        >
                            {rpExpirado ? "Solicitar nuevo código" : "Reenviar código"}
                        </Button>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cerrarRecuperacion} disabled={rpCargando}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleVerificarCodigo}
                            disabled={rpCargando || rpExpirado}
                            endIcon={rpCargando ? <CircularProgress size={16} color="inherit" /> : undefined}
                        >
                            Cambiar contraseña
                        </Button>
                    </DialogActions>
                </>
            )}

            {/* Paso 3 — Éxito */}
            {rpPaso === 3 && (
                <>
                    <DialogTitle>Contraseña restablecida</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 3 }}>
                        <CheckCircleOutline sx={{ fontSize: 64, color: "success.main" }} />
                        <Typography textAlign="center">
                            Su contraseña fue actualizada correctamente. Ya puede iniciar sesión con su nueva contraseña.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={cerrarRecuperacion} fullWidth>
                            Ir al inicio de sesión
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
        </>
    );
};

export default LoginView;
