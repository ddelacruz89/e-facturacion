import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    FormControlLabel,
    MenuItem,
    Paper,
    Snackbar,
    Switch,
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
import { DeTipoVehiculo, DeVehiculo } from "../../models/despacho/DespachoModels";
import {
    disableVehiculo,
    getVehiculos,
    saveVehiculo,
    updateVehiculo,
} from "../../apis/DeVehiculoController";
import { getTiposVehiculoActivos } from "../../apis/DeTipoVehiculoController";

const emptyVehiculo: DeVehiculo = {
    tipoId: 0,
    descripcion: "",
    placa: "",
    activo: true,
};

export const DeVehiculoView: React.FC = () => {
    const [vehiculos, setVehiculos] = useState<DeVehiculo[]>([]);
    const [tipos, setTipos] = useState<DeTipoVehiculo[]>([]);
    const [form, setForm] = useState<DeVehiculo>(emptyVehiculo);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const cargarVehiculos = () => getVehiculos().then(setVehiculos).catch(console.error);

    useEffect(() => {
        cargarVehiculos();
        getTiposVehiculoActivos().then((data) => {
            setTipos(data);
            if (data.length > 0) setForm((f) => ({ ...f, tipoId: data[0].id! }));
        }).catch(console.error);
    }, []);

    const tipoNombre = (tipoId: number) =>
        tipos.find((t) => t.id === tipoId)?.nombre ?? String(tipoId);

    const showMsg = (msg: string, severity: "success" | "error" = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleEdit = (v: DeVehiculo) => {
        setForm({ ...v });
        setEditingId(v.id!);
    };

    const handleNew = () => {
        setForm({ ...emptyVehiculo, tipoId: tipos[0]?.id ?? 0 });
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!form.descripcion.trim()) {
            showMsg("La descripción es obligatoria.", "error");
            return;
        }
        if (!form.tipoId) {
            showMsg("Seleccione un tipo de vehículo.", "error");
            return;
        }
        setLoading(true);
        try {
            if (editingId !== null) {
                await updateVehiculo(editingId, form);
                showMsg("Vehículo actualizado.");
            } else {
                await saveVehiculo(form);
                showMsg("Vehículo creado.");
            }
            cargarVehiculos();
            setForm({ ...emptyVehiculo, tipoId: tipos[0]?.id ?? 0 });
            setEditingId(null);
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (id: number) => {
        if (!window.confirm("¿Desactivar este vehículo?")) return;
        try {
            await disableVehiculo(id);
            showMsg("Vehículo desactivado.");
            cargarVehiculos();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al desactivar.", "error");
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Vehículos de Despacho">
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
                {/* Form */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        {editingId !== null ? "Editar Vehículo" : "Nuevo Vehículo"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                        <TextField
                            select
                            label="Tipo"
                            size="small"
                            value={form.tipoId || ""}
                            onChange={(e) => setForm({ ...form, tipoId: Number(e.target.value) })}
                            sx={{ minWidth: 160 }}
                        >
                            {tipos.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Descripción"
                            size="small"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            sx={{ minWidth: 240 }}
                        />
                        <TextField
                            label="Placa"
                            size="small"
                            value={form.placa ?? ""}
                            onChange={(e) => setForm({ ...form, placa: e.target.value })}
                            sx={{ minWidth: 120 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.activo ?? true}
                                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                    size="small"
                                />
                            }
                            label="Activo"
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

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: "#272C36" }}>
                            <TableRow>
                                <TableCell sx={{ color: "#fff", width: "14%" }}>Tipo</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                                <TableCell sx={{ color: "#fff", width: "14%" }}>Placa</TableCell>
                                <TableCell sx={{ color: "#fff", width: "10%" }}>Estado</TableCell>
                                <TableCell sx={{ color: "#fff", width: "14%" }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vehiculos.map((v) => (
                                <TableRow key={v.id} hover>
                                    <TableCell>{tipoNombre(v.tipoId)}</TableCell>
                                    <TableCell>{v.descripcion}</TableCell>
                                    <TableCell>{v.placa ?? "—"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={v.activo ? "Activo" : "Inactivo"}
                                            size="small"
                                            color={v.activo ? "success" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEdit(v)}
                                            sx={{ mr: 1 }}
                                        >
                                            Editar
                                        </Button>
                                        {v.activo && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDisable(v.id!)}
                                            >
                                                Desactivar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {vehiculos.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ color: "#888", py: 3 }}>
                                        No hay vehículos registrados.
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

export default DeVehiculoView;
