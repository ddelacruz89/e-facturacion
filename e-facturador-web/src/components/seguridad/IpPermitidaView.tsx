import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AddIcon from "@mui/icons-material/Add";
import ActionBar from "../../customers/ActionBar";
import { SgEmpresaIpPermitida } from "../../models/seguridad";
import {
    getIpsPermitidas,
    saveIpPermitida,
    toggleIpPermitida,
    deleteIpPermitida,
} from "../../apis/SgEmpresaIpPermitidaController";
import { formatDateTimeShort } from "../../types/modalSearchTypes";

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export default function IpPermitidaView() {
    const [ips, setIps] = useState<SgEmpresaIpPermitida[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [ipOrigen, setIpOrigen] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [ipError, setIpError] = useState("");
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

    const load = () => {
        setLoading(true);
        getIpsPermitidas()
            .then(setIps)
            .catch(() => setSnack({ msg: "Error al cargar IPs", severity: "error" }))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openDialog = () => {
        setIpOrigen("");
        setDescripcion("");
        setIpError("");
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!IP_REGEX.test(ipOrigen.trim())) {
            setIpError("Ingrese una dirección IPv4 válida (ej. 192.168.1.1)");
            return;
        }
        setSaving(true);
        try {
            await saveIpPermitida({ ipOrigen: ipOrigen.trim(), descripcion: descripcion.trim() || undefined });
            setDialogOpen(false);
            setSnack({ msg: "IP agregada correctamente", severity: "success" });
            load();
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al guardar";
            setSnack({ msg, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (ip: SgEmpresaIpPermitida) => {
        try {
            const updated = await toggleIpPermitida(ip.id!);
            setIps((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        } catch {
            setSnack({ msg: "Error al cambiar estado", severity: "error" });
        }
    };

    const handleDelete = async (ip: SgEmpresaIpPermitida) => {
        if (!window.confirm(`¿Eliminar la IP ${ip.ipOrigen}?`)) return;
        try {
            await deleteIpPermitida(ip.id!);
            setIps((prev) => prev.filter((x) => x.id !== ip.id));
            setSnack({ msg: "IP eliminada", severity: "success" });
        } catch {
            setSnack({ msg: "Error al eliminar", severity: "error" });
        }
    };

    return (
        <Box>
            <ActionBar title="IPs de Login Permitidas">
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openDialog}
                    sx={{ bgcolor: "#272C36", "&:hover": { bgcolor: "#3a4050" } }}
                >
                    Agregar IP
                </Button>
            </ActionBar>

            <Box sx={{ p: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Si esta lista tiene al menos una IP activa, los usuarios de la empresa solo
                    podrán iniciar sesión desde esas IPs. Si está vacía, no hay restricción.
                </Alert>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={{ bgcolor: "#272C36" }}>
                                <TableRow>
                                    <TableCell sx={{ color: "#fff" }}>IP</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Estado</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Fecha Reg.</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>Usuario</TableCell>
                                    <TableCell sx={{ color: "#fff" }} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            Sin IPs configuradas — acceso sin restricción
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ips.map((ip) => (
                                        <TableRow key={ip.id} hover>
                                            <TableCell>
                                                <Typography fontFamily="monospace" fontSize={14}>
                                                    {ip.ipOrigen}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{ip.descripcion || "—"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ip.activo ? "Activa" : "Inactiva"}
                                                    size="small"
                                                    color={ip.activo ? "success" : "default"}
                                                />
                                            </TableCell>
                                            <TableCell>{formatDateTimeShort(ip.fechaReg)}</TableCell>
                                            <TableCell>{ip.usuarioReg}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title={ip.activo ? "Desactivar" : "Activar"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggle(ip)}
                                                        color={ip.activo ? "success" : "default"}
                                                    >
                                                        <PowerSettingsNewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(ip)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Agregar IP permitida</DialogTitle>
                <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Dirección IP"
                        value={ipOrigen}
                        onChange={(e) => { setIpOrigen(e.target.value); setIpError(""); }}
                        error={!!ipError}
                        helperText={ipError || "Ej: 201.232.45.10"}
                        placeholder="0.0.0.0"
                        inputProps={{ fontFamily: "monospace" }}
                        autoFocus
                        fullWidth
                    />
                    <TextField
                        label="Descripción (opcional)"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Ej: Oficina principal"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving || !ipOrigen.trim()}
                        sx={{ bgcolor: "#272C36", "&:hover": { bgcolor: "#3a4050" } }}
                    >
                        {saving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!snack}
                autoHideDuration={4000}
                onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snack?.severity} onClose={() => setSnack(null)}>
                    {snack?.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
