import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ActionBar from "../../customers/ActionBar";
import { DeTipoVehiculo } from "../../models/despacho/DespachoModels";
import {
    disableTipoVehiculo,
    getTiposVehiculo,
    saveTipoVehiculo,
    updateTipoVehiculo,
} from "../../apis/DeTipoVehiculoController";

const emptyTipo: DeTipoVehiculo = { nombre: "", activo: true };

export const DeTipoVehiculoView: React.FC = () => {
    const [tipos, setTipos] = useState<DeTipoVehiculo[]>([]);
    const [form, setForm] = useState<DeTipoVehiculo>(emptyTipo);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const cargar = () => getTiposVehiculo().then(setTipos).catch(console.error);

    useEffect(() => { cargar(); }, []);

    const showMsg = (msg: string, severity: "success" | "error" = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleEdit = (t: DeTipoVehiculo) => {
        setForm({ ...t });
        setEditingId(t.id!);
    };

    const handleNew = () => {
        setForm(emptyTipo);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            showMsg("El nombre es obligatorio.", "error");
            return;
        }
        setLoading(true);
        try {
            if (editingId !== null) {
                await updateTipoVehiculo(editingId, form);
                showMsg("Tipo actualizado.");
            } else {
                await saveTipoVehiculo(form);
                showMsg("Tipo creado.");
            }
            cargar();
            setForm(emptyTipo);
            setEditingId(null);
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (id: number) => {
        if (!window.confirm("¿Desactivar este tipo de vehículo?")) return;
        try {
            await disableTipoVehiculo(id);
            showMsg("Tipo desactivado.");
            cargar();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al desactivar.", "error");
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Tipos de Vehículo">
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleNew}
                    sx={{ backgroundColor: "#272C36", "&:hover": { backgroundColor: "#3d4452" } }}
                >
                    Nuevo
                </Button>
            </ActionBar>

            <Box sx={{ p: 2 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        {editingId !== null ? "Editar Tipo" : "Nuevo Tipo"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <TextField
                            label="Nombre"
                            size="small"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value.toUpperCase() })}
                            inputProps={{ maxLength: 50 }}
                            sx={{ minWidth: 240 }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSave}
                            disabled={loading}
                            sx={{ backgroundColor: "#272C36", "&:hover": { backgroundColor: "#3d4452" } }}
                        >
                            {editingId !== null ? "Actualizar" : "Guardar"}
                        </Button>
                        {editingId !== null && (
                            <Button size="small" onClick={handleNew}>
                                Cancelar
                            </Button>
                        )}
                    </Box>
                </Paper>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: "#272C36" }}>
                            <TableRow>
                                <TableCell sx={{ color: "#fff", width: "8%" }}>ID</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Nombre</TableCell>
                                <TableCell sx={{ color: "#fff", width: "12%" }}>Estado</TableCell>
                                <TableCell sx={{ color: "#fff", width: "18%" }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tipos.map((t) => (
                                <TableRow key={t.id} hover>
                                    <TableCell>{t.id}</TableCell>
                                    <TableCell>{t.nombre}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={t.activo ? "Activo" : "Inactivo"}
                                            size="small"
                                            color={t.activo ? "success" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEdit(t)}
                                            sx={{ mr: 1 }}
                                        >
                                            Editar
                                        </Button>
                                        {t.activo && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDisable(t.id!)}
                                            >
                                                Desactivar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tipos.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ color: "#888", py: 3 }}>
                                        No hay tipos registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DeTipoVehiculoView;
