import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { DeOrdenDespachoResumen, DeRutaEntrega, DeRutaEntregaResumen, MfFacturaParaDespacho } from "../../models/despacho/DespachoModels";
import {
    asignarFacturasARuta,
    cambiarEstadoRuta,
    disableRutaEntrega,
    getRutaEntrega,
    saveRutaEntrega,
} from "../../apis/DeRutaEntregaController";
import { buscarOrdenesDespacho } from "../../apis/DeOrdenDespachoController";
import { getFacturasParaDespacho } from "../../apis/FacturaController";
import { getVehiculosActivos } from "../../apis/DeVehiculoController";
import { DeVehiculo } from "../../models/despacho/DespachoModels";
import UserSelectorField from "../shared/UserSelectorField";

const ESTADO_RUTA_LABELS: Record<string, { label: string; color: "default" | "warning" | "info" | "success" | "error" }> = {
    PLANIFICADA: { label: "Planificada", color: "warning" },
    EN_CURSO: { label: "En Curso", color: "info" },
    COMPLETADA: { label: "Completada", color: "success" },
    ANU: { label: "Anulada", color: "default" },
};

const ESTADO_ORDEN_LABELS: Record<string, { label: string; color: "default" | "warning" | "info" | "success" | "error" }> = {
    PEN: { label: "Pendiente", color: "default" },
    EN_RUTA: { label: "En Ruta", color: "warning" },
    EN_CAMINO: { label: "En Camino", color: "info" },
    ENTREGADO: { label: "Entregado", color: "success" },
    DEVUELTO: { label: "Devuelto", color: "error" },
    ANU: { label: "Anulada", color: "default" },
};

const emptyRuta: DeRutaEntrega = {
    fecha: new Date().toISOString().split("T")[0],
    vehiculoId: undefined,
    conductorUsername: "",
    notas: "",
};

export const DeRutaEntregaView: React.FC = () => {
    const [ruta, setRuta] = useState<DeRutaEntrega>(emptyRuta);
    const [selectedRuta, setSelectedRuta] = useState<DeRutaEntrega | null>(null);
    const [vehiculos, setVehiculos] = useState<DeVehiculo[]>([]);
    const [facturasParaDespacho, setFacturasParaDespacho] = useState<MfFacturaParaDespacho[]>([]);
    const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<Set<number>>(new Set());
    const [ordenesAsignadas, setOrdenesAsignadas] = useState<DeOrdenDespachoResumen[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const rutaSearch = useModalSearch();

    useEffect(() => {
        getVehiculosActivos().then(setVehiculos).catch(console.error);
    }, []);

    const cargarFacturasDespacho = () => {
        getFacturasParaDespacho().then(setFacturasParaDespacho).catch(console.error);
    };

    const cargarOrdenesDeRuta = (rutaId: number) => {
        buscarOrdenesDespacho({ rutaId, page: 0, size: 100 })
            .then((result: any) => setOrdenesAsignadas(Array.isArray(result) ? result : (result?.content ?? [])))
            .catch(console.error);
    };

    const showMsg = (msg: string, severity: "success" | "error" = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleNueva = () => {
        setRuta(emptyRuta);
        setSelectedRuta(null);
        setFacturasSeleccionadas(new Set());
        setOrdenesAsignadas([]);
    };

    const handleSelectRuta = rutaSearch.handleSelect(async (resumen: any) => {
        const completo = await getRutaEntrega(resumen.id);
        setSelectedRuta(completo);
        setRuta(completo);
        setFacturasSeleccionadas(new Set());
        cargarOrdenesDeRuta(resumen.id);
        cargarFacturasDespacho();
    });

    const toggleFactura = (id: number) => {
        setFacturasSeleccionadas((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        if (!ruta.vehiculoId) { showMsg("Seleccione un vehículo.", "error"); return; }
        if (!ruta.conductorUsername?.trim()) { showMsg("Ingrese el usuario del conductor.", "error"); return; }
        if (!ruta.fecha) { showMsg("La fecha es obligatoria.", "error"); return; }
        setLoading(true);
        try {
            const saved = selectedRuta?.id
                ? await saveRutaEntrega({ ...ruta })
                : await saveRutaEntrega(ruta);
            setSelectedRuta(saved);
            setRuta(saved);
            showMsg("Ruta guardada.");
            cargarFacturasDespacho();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAsignarFacturas = async () => {
        if (!selectedRuta?.id || facturasSeleccionadas.size === 0) return;
        setLoading(true);
        try {
            await asignarFacturasARuta(selectedRuta.id, Array.from(facturasSeleccionadas));
            showMsg(`${facturasSeleccionadas.size} factura(s) asignada(s) a la ruta.`);
            setFacturasSeleccionadas(new Set());
            cargarOrdenesDeRuta(selectedRuta.id);
            cargarFacturasDespacho();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al asignar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async (estadoId: string) => {
        if (!selectedRuta?.id) return;
        setLoading(true);
        try {
            const updated = await cambiarEstadoRuta(selectedRuta.id, estadoId);
            setSelectedRuta(updated);
            setRuta(updated);
            showMsg(`Estado actualizado a: ${ESTADO_RUTA_LABELS[estadoId]?.label ?? estadoId}`);
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al cambiar estado.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAnular = async () => {
        if (!selectedRuta?.id) return;
        if (!window.confirm("¿Anular esta ruta? Las órdenes asignadas volverán a estado Pendiente.")) return;
        setLoading(true);
        try {
            await disableRutaEntrega(selectedRuta.id);
            showMsg("Ruta anulada.");
            handleNueva();
            cargarFacturasDespacho();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al anular.", "error");
        } finally {
            setLoading(false);
        }
    };

    const estadoRuta = selectedRuta?.estadoId ?? "";
    const isEditable = !selectedRuta || estadoRuta === "PLANIFICADA";

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Rutas de Entrega">
                <SearchButton
                    config={SEARCH_CONFIGS.RUTA_ENTREGA}
                    onOpenSearch={rutaSearch.openModal}
                    variant="button"
                    label="Buscar Ruta"
                />
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleNueva}
                    sx={{ backgroundColor: "#272C36", "&:hover": { backgroundColor: "#3d4452" } }}
                >
                    Nueva Ruta
                </Button>
            </ActionBar>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Estado de la ruta */}
                    {selectedRuta && (
                        <Grid size={12}>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ruta #{selectedRuta.secuencia} —
                                </Typography>
                                <Chip
                                    label={ESTADO_RUTA_LABELS[estadoRuta]?.label ?? estadoRuta}
                                    color={ESTADO_RUTA_LABELS[estadoRuta]?.color ?? "default"}
                                    size="small"
                                />
                                {estadoRuta === "PLANIFICADA" && (
                                    <Button size="small" color="primary" onClick={() => handleCambiarEstado("EN_CURSO")}>
                                        Iniciar Ruta
                                    </Button>
                                )}
                                {estadoRuta === "EN_CURSO" && (
                                    <>
                                        <Button size="small" color="success" onClick={() => handleCambiarEstado("COMPLETADA")}>
                                            Completar Ruta
                                        </Button>
                                        <Button size="small" color="warning" onClick={() => handleCambiarEstado("PLANIFICADA")}>
                                            Regresar a Planificada
                                        </Button>
                                    </>
                                )}
                                {(estadoRuta === "PLANIFICADA" || estadoRuta === "EN_CURSO") && (
                                    <Button size="small" color="error" onClick={handleAnular}>
                                        Anular
                                    </Button>
                                )}
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                    )}

                    {/* Formulario de ruta */}
                    <Grid size={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                {selectedRuta ? "Datos de la Ruta" : "Nueva Ruta de Entrega"}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Fecha"
                                        type="date"
                                        size="small"
                                        fullWidth
                                        value={ruta.fecha ?? ""}
                                        onChange={(e) => setRuta({ ...ruta, fecha: e.target.value })}
                                        disabled={!isEditable}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        label="Vehículo"
                                        size="small"
                                        fullWidth
                                        value={ruta.vehiculoId ?? ""}
                                        onChange={(e) => setRuta({ ...ruta, vehiculoId: Number(e.target.value) })}
                                        disabled={!isEditable}
                                        SelectProps={{ native: true }}
                                    >
                                        <option value="">— Seleccione —</option>
                                        {vehiculos.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.descripcion} {v.placa ? `(${v.placa})` : ""}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <UserSelectorField
                                        label="Conductor"
                                        value={ruta.conductorUsername ?? ""}
                                        onChange={(username) => setRuta({ ...ruta, conductorUsername: username })}
                                        disabled={!isEditable}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        label="Notas"
                                        size="small"
                                        fullWidth
                                        value={ruta.notas ?? ""}
                                        onChange={(e) => setRuta({ ...ruta, notas: e.target.value })}
                                        disabled={estadoRuta === "ANU" || estadoRuta === "COMPLETADA"}
                                    />
                                </Grid>
                            </Grid>
                            {isEditable && (
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={loading}
                                        sx={{ backgroundColor: "#272C36", "&:hover": { backgroundColor: "#3d4452" } }}
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit" /> : "Guardar Ruta"}
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Órdenes ya asignadas a esta ruta */}
                    {selectedRuta && (
                        <Grid size={12}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Órdenes Asignadas a esta Ruta
                                    </Typography>
                                    <Chip
                                        label={`${ordenesAsignadas.length} orden(es)`}
                                        size="small"
                                        color={ordenesAsignadas.length > 0 ? "primary" : "default"}
                                        variant="outlined"
                                    />
                                </Box>
                                {ordenesAsignadas.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No hay órdenes asignadas a esta ruta.
                                    </Typography>
                                ) : (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ "& th": { fontWeight: 600, py: 0.75, fontSize: "0.75rem", color: "text.secondary" } }}>
                                                <TableCell>No. Orden</TableCell>
                                                <TableCell>Factura No.</TableCell>
                                                <TableCell>Cliente</TableCell>
                                                <TableCell>Compromiso</TableCell>
                                                <TableCell>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {ordenesAsignadas.map((o) => (
                                                <TableRow key={o.id} sx={{ "&:last-child td": { border: 0 } }}>
                                                    <TableCell sx={{ py: 0.5 }}>{o.secuencia}</TableCell>
                                                    <TableCell sx={{ py: 0.5 }}>{o.facturaSecuencia}</TableCell>
                                                    <TableCell sx={{ py: 0.5 }}>{o.clienteNombre}</TableCell>
                                                    <TableCell sx={{ py: 0.5, whiteSpace: "nowrap" }}>
                                                        {o.fechaCompromiso
                                                            ? new Date(o.fechaCompromiso).toLocaleDateString("es-DO")
                                                            : "—"}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 0.5 }}>
                                                        <Chip
                                                            label={ESTADO_ORDEN_LABELS[o.estadoId]?.label ?? o.estadoId}
                                                            color={ESTADO_ORDEN_LABELS[o.estadoId]?.color ?? "default"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </Paper>
                        </Grid>
                    )}

                    {/* Asignar facturas a la ruta */}
                    {selectedRuta && (estadoRuta === "PLANIFICADA" || estadoRuta === "EN_CURSO") && (
                        <Grid size={12}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Facturas para Despacho — Asignar a esta Ruta
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AssignmentIcon />}
                                        onClick={handleAsignarFacturas}
                                        disabled={loading || facturasSeleccionadas.size === 0}
                                        sx={{ backgroundColor: "#525C71", "&:hover": { backgroundColor: "#272C36" } }}
                                    >
                                        Asignar ({facturasSeleccionadas.size})
                                    </Button>
                                </Box>
                                {facturasParaDespacho.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No hay facturas pagadas con envío pendiente de asignar.
                                    </Typography>
                                ) : (
                                    facturasParaDespacho.map((f) => (
                                        <Box
                                            key={f.id}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                py: 0.5,
                                                borderBottom: "1px solid #f0f0f0",
                                            }}
                                        >
                                            <Checkbox
                                                size="small"
                                                checked={facturasSeleccionadas.has(f.id)}
                                                onChange={() => toggleFactura(f.id)}
                                            />
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                <strong>Factura #{f.secuencia}</strong> — {f.razonSocial}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(f.fechaReg).toLocaleDateString("es-DO")}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontWeight: 600 }}>
                                                RD$ {f.total?.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <ModalSearch
                open={rutaSearch.isOpen}
                onClose={rutaSearch.closeModal}
                onSelect={handleSelectRuta}
                config={rutaSearch.config ?? SEARCH_CONFIGS.RUTA_ENTREGA}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
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

export default DeRutaEntregaView;
