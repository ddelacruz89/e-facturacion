import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Container,
    CircularProgress,
    List,
    ListItemButton,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    AccountCircle,
    Lock,
    Business,
    ArrowBack,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest } from "../../models/auth";

interface LoginFormData {
    username: string;
    password: string;
}

const LoginView: React.FC = () => {
    const { login, selectSucursal, pendingAuth, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

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
                                <Button variant="text" size="small">
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
    );
};

export default LoginView;
