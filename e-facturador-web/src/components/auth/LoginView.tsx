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
} from "@mui/material";
import { Visibility, VisibilityOff, AccountCircle, Lock } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest } from "../../models/auth";

interface LoginFormData {
    username: string;
    password: string;
    rememberMe?: boolean;
}

const LoginView: React.FC = () => {
    const { login, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoginError(null);
            await login({
                username: data.username,
                password: data.password,
            });
            // Redirect will be handled by the router/auth context
        } catch (error: any) {
            setLoginError(error.message || "Error durante el login");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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
                    sx={{
                        padding: 4,
                        width: "100%",
                        maxWidth: 400,
                        borderRadius: 2,
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mb: 3,
                        }}>
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
                                minLength: {
                                    value: 3,
                                    message: "El nombre de usuario debe tener al menos 3 caracteres",
                                },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Nombre de Usuario"
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
                                minLength: {
                                    value: 6,
                                    message: "La contraseña debe tener al menos 6 caracteres",
                                },
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
                                                    onClick={togglePasswordVisibility}
                                                    edge="end"
                                                    aria-label="toggle password visibility">
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
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                            }}
                            startIcon={(isLoading || isSubmitting) && <CircularProgress size={20} color="inherit" />}>
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
