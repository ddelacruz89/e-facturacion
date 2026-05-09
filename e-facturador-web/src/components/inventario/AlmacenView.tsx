import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ActionBar from "../../customers/ActionBar";
import {
    buscarAlmacenes,
    disableAlmacen,
    enableAlmacen,
    saveAlmacen,
    updateAlmacen,
    InAlmacenResumenDTO,
} from "../../apis/AlmacenController";
import { getSucursales } from "../../apis/SucursalController";
import { SgSucursal } from "../../models/seguridad/SgSucursal";
import AlmacenBuscarModal from "./AlmacenBuscarModal";

// -- tipos locales -------------------------------------------------------------

interface FormState {
    id: number | null;
    nombre: string;
    ubicacion: string;
    sucursalId: number | "";
}

const FORM_VACIO: FormState = { id: null, nombre: "", ubicacion: "", sucursalId: "" };

// -- component -----------------------------------------------------------------

const AlmacenView: React.FC = () => {
    // form
    const [form, setForm] = useState<FormState>(FORM_VACIO);
    const [guardando, setGuardando] = useState(false);

    // catalogos
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);

    // lista (todos los almacenes de la empresa)
    const [lista, setLista] = useState<InAlmacenResumenDTO[]>([]);
    const [cargandoLista, setCargandoLista] = useState(false);

    // modal buscar
    const [buscarOpen, setBuscarOpen] = useState(false);

    // snackbar
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

    const notificar = (msg: string, sev: "success" | "error" = "success") => {
        setSnackMsg(msg);
        setSnackSeverity(sev);
        setSnackOpen(true);
    };

    // -- carga inicial --
    useEffect(() => {
        getSucursales().then(setSucursales).catch(() => {});
        cargarLista();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const cargarLista = useCallback(async () => {
        setCargandoLista(true);
        try {
            const data = await buscarAlmacenes({});
            setLista(data);
        } catch {
            notificar("Error al cargar almacenes", "error");
        } finally {
            setCargandoLista(false);
        }
    }, []);

    // -- handlers --
    const handleNuevo = () => setForm(FORM_VACIO);

    const handleCargarEnForm = (r: InAlmacenResumenDTO) => {
        setForm({
            id: r.id,
            nombre: r.nombre,
            ubicacion: r.ubicacion ?? "",
            sucursalId: r.sucursalId ?? "",
        });
    };

    const handleGuardar = async () => {
        if (!form.nombre.trim()) {
            notificar("El nombre es requerido", "error");
            return;
        }
        if (form.sucursalId === "") {
            notificar("Debe seleccionar una sucursal", "error");
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                nombre: form.nombre.trim(),
                ubicacion: form.ubicacion.trim() || undefined,
                sucursalId: form.sucursalId as number,
            };
            if (form.id) {
                await updateAlmacen(form.id, payload);
                notificar("Almacen actualizado");
            } else {
                const created = await saveAlmacen(payload);
                // Refrescar lista y seleccionar el nuevo registro
                const nuevaLista = await buscarAlmacenes({});
                setLista(nuevaLista);
                const nuevo = nuevaLista.find((a) => a.id === created.id);
                if (nuevo) setForm((f) => ({ ...f, id: created.id ?? null }));
                notificar("Almacen creado");
                return;
            }
            cargarLista();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Error al guardar";
            notificar(msg, "error");
        } finally {
            setGuardando(false);
        }
    };

    const handleToggleEstado = async (r: InAlmacenResumenDTO) => {
        try {
            if (r.estadoId === "ACT") {
                await disableAlmacen(r.id);
                notificar(`"${r.nombre}" desactivado`);
            } else {
                await enableAlmacen(r.id);
                notificar(`"${r.nombre}" activado`);
            }
            cargarLista();
        } catch {
            notificar("Error al cambiar estado", "error");
        }
    };

    const handleSelectBuscar = (resumen: InAlmacenResumenDTO) => {
        handleCargarEnForm(resumen);
    };

    // -- render ---------------------------------------------------------------

    const sucursalNombre = (id: number | "") => {
        if (id === "") return "";
        return sucursales.find((s) => s.id === id)?.nombre ?? String(id);
    };

    return (
        <>
            {/* Barra de accion */}
            <ActionBar title="Mantenimiento de Almacenes">
                <Button
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleNuevo}
                    disabled={guardando}
                >
                    Nuevo
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={
                        guardando ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />
                    }
                    onClick={handleGuardar}
                    disabled={guardando}
                >
                    Guardar
                </Button>
                <Button
                    size="small"
                    startIcon={<SearchIcon />}
                    onClick={() => setBuscarOpen(true)}
                >
                    Buscar
                </Button>
            </ActionBar>

            {/* Formulario */}
            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, p: 2.5 }}>
                <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 1.5, color: "text.secondary" }}
                >
                    {form.id ? `Editando Almacen #${form.id}` : "Nuevo Almacen"}
                </Typography>

                <Grid container spacing={2}>
                    {/* ID (solo lectura) */}
                    {form.id && (
                        <Grid size={{ xs: 6, sm: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel shrink>ID</InputLabel>
                                <OutlinedInput
                                    notched
                                    label="ID"
                                    value={form.id}
                                    readOnly
                                    sx={{ bgcolor: "action.hover" }}
                                />
                            </FormControl>
                        </Grid>
                    )}

                    {/* Sucursal */}
                    <Grid size={{ xs: 12, sm: form.id ? 4 : 5 }}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Sucursal *</InputLabel>
                            <Select
                                label="Sucursal *"
                                value={form.sucursalId}
                                onChange={(e) => {
                                    const v = e.target.value as string | number;
                                    setForm((f) => ({
                                        ...f,
                                        sucursalId: v === "" ? "" : Number(v),
                                    }));
                                }}
                            >
                                <MenuItem value="" disabled>
                                    Seleccione...
                                </MenuItem>
                                {sucursales.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Nombre */}
                    <Grid size={{ xs: 12, sm: form.id ? 3 : 4 }}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Nombre *</InputLabel>
                            <OutlinedInput
                                label="Nombre *"
                                value={form.nombre}
                                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
                                inputProps={{ maxLength: 100 }}
                            />
                        </FormControl>
                    </Grid>

                    {/* Ubicacion */}
                    <Grid size={{ xs: 12, sm: form.id ? 3 : 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Ubicacion</InputLabel>
                            <OutlinedInput
                                label="Ubicacion"
                                value={form.ubicacion}
                                onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))}
                                inputProps={{ maxLength: 200 }}
                            />
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Lista de almacenes de la empresa */}
            <Paper variant="outlined" sx={{ mx: 2.5, mt: 2, overflow: "hidden" }}>
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={700}>
                        Almacenes de la empresa
                    </Typography>
                    {cargandoLista && <CircularProgress size={16} />}
                </Box>

                <Divider />

                <TableContainer sx={{ maxHeight: 420 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "7%" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "22%" }}>Sucursal</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "25%" }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "25%" }}>Ubicacion</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.100", width: "10%" }}>Estado</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.100", width: "11%" }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lista.length === 0 && !cargandoLista ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No hay almacenes registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lista.map((a) => (
                                    <TableRow
                                        key={a.id}
                                        hover
                                        selected={form.id === a.id}
                                        sx={{ opacity: a.estadoId === "INA" ? 0.6 : 1 }}
                                    >
                                        <TableCell>{a.id}</TableCell>
                                        <TableCell sx={{ color: "text.secondary" }}>
                                            {a.sucursalNombre || sucursalNombre(a.sucursalId ?? "")}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: form.id === a.id ? 600 : 400 }}>
                                            {a.nombre}
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary" }}>
                                            {a.ubicacion || "—"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {a.estadoId === "ACT" ? (
                                                <Chip label="Activo" color="success" size="small" />
                                            ) : (
                                                <Chip label="Inactivo" color="default" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCargarEnForm(a)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={a.estadoId === "ACT" ? "Desactivar" : "Activar"}>
                                                <IconButton
                                                    size="small"
                                                    color={a.estadoId === "ACT" ? "error" : "success"}
                                                    onClick={() => handleToggleEstado(a)}
                                                >
                                                    {a.estadoId === "ACT" ? (
                                                        <ToggleOffIcon fontSize="small" />
                                                    ) : (
                                                        <ToggleOnIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal busqueda cross-sucursal */}
            <AlmacenBuscarModal
                open={buscarOpen}
                onClose={() => setBuscarOpen(false)}
                onSelect={handleSelectBuscar}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackOpen(false)}
                    severity={snackSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AlmacenView;
