import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { McCuenta, McCuentaNodoDTO, McCuentaRequestDTO, McTipoCuenta } from "../../models/contabilidad/McCuenta";
import { getTiposCuenta } from "../../apis/McTipoCuentaController";
import { crearCuenta, actualizarCuenta, getCuenta } from "../../apis/McCuentaController";

interface McCuentaFormDialogProps {
    open: boolean;
    /** Cuenta padre cuando se crea una sub-cuenta; null/undefined para cuenta raíz. */
    padre?: McCuentaNodoDTO | null;
    /** id de la cuenta a editar; undefined para creación. */
    editId?: number | null;
    onClose: () => void;
    onSaved: () => void;
}

const emptyForm: McCuentaRequestDTO = {
    tipoCuentaId: 0,
    cuentaPadreId: null,
    nivel1: "",
    nivel2: "",
    nivel3: "",
    nivel4: "",
    nivel: 1,
    orden: 0,
    cuenta: "",
    nombreCuenta: "",
    permiteMovimiento: true,
};

const McCuentaFormDialog: React.FC<McCuentaFormDialogProps> = ({ open, padre, editId, onClose, onSaved }) => {
    const [tipos, setTipos] = useState<McTipoCuenta[]>([]);
    const [form, setForm] = useState<McCuentaRequestDTO>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!open) return;
        getTiposCuenta().then(setTipos).catch(() => {});
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setErrorMsg("");
        if (editId) {
            getCuenta(editId).then((c: McCuenta) => {
                setForm({
                    tipoCuentaId: c.tipoCuentaId?.id ?? 0,
                    cuentaPadreId: c.cuentaPadreId?.id ?? null,
                    nivel1: c.nivel1 ?? "",
                    nivel2: c.nivel2 ?? "",
                    nivel3: c.nivel3 ?? "",
                    nivel4: c.nivel4 ?? "",
                    nivel: c.nivel ?? 1,
                    orden: c.orden ?? 0,
                    cuenta: c.cuenta,
                    nombreCuenta: c.nombreCuenta,
                    permiteMovimiento: c.permiteMovimiento,
                });
            });
        } else {
            setForm({
                ...emptyForm,
                cuentaPadreId: padre ? padre.id : null,
                nivel: padre ? (padre.nivel ?? 0) + 1 : 1,
            });
        }
    }, [open, editId, padre]);

    const setField = (field: keyof McCuentaRequestDTO, value: unknown) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.tipoCuentaId) {
            setErrorMsg("Selecciona el tipo de cuenta.");
            return;
        }
        if (!form.cuenta.trim() || !form.nombreCuenta.trim()) {
            setErrorMsg("Código y nombre de la cuenta son obligatorios.");
            return;
        }
        setSaving(true);
        setErrorMsg("");
        try {
            if (editId) {
                await actualizarCuenta(editId, form);
            } else {
                await crearCuenta(form);
            }
            onSaved();
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || "Error al guardar la cuenta.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editId ? "Editar cuenta" : padre ? `Nueva sub-cuenta de ${padre.cuenta}` : "Nueva cuenta raíz"}
            </DialogTitle>
            <DialogContent>
                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMsg}
                    </Alert>
                )}
                {padre && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Cuenta padre: <strong>{padre.cuenta}</strong> — {padre.nombreCuenta}
                    </Typography>
                )}
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Tipo de cuenta</InputLabel>
                            <Select
                                label="Tipo de cuenta"
                                value={form.tipoCuentaId || ""}
                                onChange={(e) => setField("tipoCuentaId", Number(e.target.value))}
                            >
                                {tipos.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.tipoCuenta} ({t.cr ? "crédito" : "débito"})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Código de cuenta"
                            size="small"
                            fullWidth
                            value={form.cuenta}
                            onChange={(e) => setField("cuenta", e.target.value)}
                            placeholder="ej. 1.01.1.0001"
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label="Nombre de la cuenta"
                            size="small"
                            fullWidth
                            value={form.nombreCuenta}
                            onChange={(e) => setField("nombreCuenta", e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Nivel 1"
                            size="small"
                            fullWidth
                            value={form.nivel1}
                            onChange={(e) => setField("nivel1", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Nivel 2"
                            size="small"
                            fullWidth
                            value={form.nivel2}
                            onChange={(e) => setField("nivel2", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Nivel 3"
                            size="small"
                            fullWidth
                            value={form.nivel3}
                            onChange={(e) => setField("nivel3", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                            label="Nivel 4"
                            size="small"
                            fullWidth
                            value={form.nivel4}
                            onChange={(e) => setField("nivel4", e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                            label="Profundidad (nivel)"
                            size="small"
                            fullWidth
                            type="number"
                            value={form.nivel ?? ""}
                            onChange={(e) => setField("nivel", parseInt(e.target.value) || undefined)}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                            label="Orden"
                            size="small"
                            fullWidth
                            type="number"
                            value={form.orden ?? ""}
                            onChange={(e) => setField("orden", parseInt(e.target.value) || 0)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={form.permiteMovimiento}
                                    onChange={(e) => setField("permiteMovimiento", e.target.checked)}
                                />
                            }
                            label="Permite movimiento"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ bgcolor: "#272C36", "&:hover": { bgcolor: "#1a1f27" } }}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default McCuentaFormDialog;
