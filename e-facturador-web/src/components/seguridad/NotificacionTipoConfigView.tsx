import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Snackbar,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import ActionBar from "../../customers/ActionBar";
import apiClient from "../../services/apiClient";
import { SgNotificacionTipoConfigDTO } from "../../models/seguridad";

const BASE_URL = "/api/v1/notificaciones/tipos";

const NotificacionTipoConfigView: React.FC = () => {
    const [tipos, setTipos] = useState<SgNotificacionTipoConfigDTO[]>([]);
    const [cargando, setCargando] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false, message: "", severity: "success",
    });

    const cargar = () => {
        setCargando(true);
        apiClient
            .get(BASE_URL)
            .then((r: { data: SgNotificacionTipoConfigDTO[] }) => setTipos(r.data))
            .catch(() => setSnackbar({ open: true, message: "Error al cargar los tipos", severity: "error" }))
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, []);

    const toggle = async (tipo: SgNotificacionTipoConfigDTO, campo: "paraLogin" | "accesoRestringido" | "activo") => {
        const nuevoValor = !tipo[campo];
        try {
            await apiClient.patch(`${BASE_URL}/${tipo.tipoId}`, { [campo]: nuevoValor });
            setTipos((prev) => prev.map((t) => t.tipoId === tipo.tipoId ? { ...t, [campo]: nuevoValor } : t));
        } catch {
            setSnackbar({ open: true, message: "Error al actualizar", severity: "error" });
        }
    };

    const moduloColor: Record<string, "default" | "primary" | "secondary" | "warning" | "info" | "error"> = {
        INVENTARIO: "primary",
        FACTURACION: "warning",
        APROBACIONES: "info",
        DESPACHO: "secondary",
    };

    return (
        <main>
            <ActionBar title="Configuración de avisos">
                <Button size="small" variant="outlined" onClick={cargar} disabled={cargando}>
                    Refrescar
                </Button>
            </ActionBar>

            <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Configura los tipos de aviso del sistema. <strong>Aviso al login</strong> significa
                    que ese tipo aparecerá como ventana modal al iniciar sesión — solo lo reciben los usuarios
                    que tengan ese tipo marcado en su perfil (acceso restringido). Si un tipo{" "}
                    <em>no</em> tiene acceso restringido, lo reciben todos los usuarios del tenant.
                </Typography>

                {cargando ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Módulo</TableCell>
                                    <TableCell>Descripción</TableCell>
                                    <TableCell align="center">Aviso al login</TableCell>
                                    <TableCell align="center">
                                        Acceso restringido
                                        <Typography variant="caption" display="block" color="text.secondary" lineHeight={1.2}>
                                            (solo usuarios marcados)
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">Activo</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tipos.map((tipo) => (
                                    <TableRow
                                        key={tipo.tipoId}
                                        hover
                                        sx={{ bgcolor: tipo.accesoRestringido ? "#fff8e1" : "inherit" }}
                                    >
                                        <TableCell>
                                            <Typography variant="caption" fontFamily="monospace">
                                                {tipo.tipoId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{tipo.nombre}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={tipo.modulo}
                                                size="small"
                                                color={moduloColor[tipo.modulo] ?? "default"}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {tipo.descripcion}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                size="small"
                                                checked={tipo.paraLogin}
                                                onChange={() => toggle(tipo, "paraLogin")}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                size="small"
                                                color="warning"
                                                checked={tipo.accesoRestringido}
                                                onChange={() => toggle(tipo, "accesoRestringido")}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                size="small"
                                                checked={tipo.activo}
                                                onChange={() => toggle(tipo, "activo")}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default NotificacionTipoConfigView;
