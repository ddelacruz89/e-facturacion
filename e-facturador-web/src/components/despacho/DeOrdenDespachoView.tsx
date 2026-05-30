import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SearchIcon from "@mui/icons-material/Search";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { DeOrdenDespacho, DeOrdenDespachoResumen, MfFacturaParaDespacho } from "../../models/despacho/DespachoModels";
import {
    disableOrdenDespacho,
    getOrdenDespacho,
    marcarEstadoOrden,
    saveOrdenDespacho,
} from "../../apis/DeOrdenDespachoController";
import { getByNumeroFactura, getFacturasParaDespacho } from "../../apis/FacturaController";

const ESTADO_LABELS: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "success" | "error" }> = {
    PEN: { label: "Pendiente", color: "warning" },
    EN_RUTA: { label: "En Ruta", color: "info" },
    EN_CAMINO: { label: "En Camino", color: "primary" },
    ENTREGADO: { label: "Entregado", color: "success" },
    DEVUELTO: { label: "Devuelto", color: "error" },
    ANU: { label: "Anulado", color: "default" },
};

const emptyOrden: DeOrdenDespacho = {
    facturaId: undefined,
    facturaSecuencia: undefined,
    clienteId: undefined,
    clienteNombre: "",
    clienteTelefono: "",
    direccionEntrega: "",
    fechaCompromiso: "",
    notas: "",
};

export const DeOrdenDespachoView: React.FC = () => {
    const [orden, setOrden] = useState<DeOrdenDespacho>(emptyOrden);
    const [selectedOrden, setSelectedOrden] = useState<DeOrdenDespacho | null>(null);
    const [numeroFactura, setNumeroFactura] = useState("");
    const [buscandoFactura, setBuscandoFactura] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [facturasDialogOpen, setFacturasDialogOpen] = useState(false);
    const [facturasParaDespacho, setFacturasParaDespacho] = useState<MfFacturaParaDespacho[]>([]);
    const [cargandoFacturas, setCargandoFacturas] = useState(false);

    const ordenSearch = useModalSearch();

    const showMsg = (msg: string, severity: "success" | "error" = "success") => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleNueva = () => {
        setOrden(emptyOrden);
        setSelectedOrden(null);
        setNumeroFactura("");
    };

    const handleBuscarFactura = async () => {
        if (!numeroFactura.trim()) return;
        setBuscandoFactura(true);
        try {
            const factura = await getByNumeroFactura(parseInt(numeroFactura));
            if (!factura) {
                showMsg("Factura no encontrada.", "error");
                return;
            }
            setOrden((prev) => ({
                ...prev,
                facturaId: factura.id,
                facturaSecuencia: factura.secuencia,
                clienteId: factura.clienteId,
                clienteNombre: factura.razonSocial ?? "",
            }));
        } catch {
            showMsg("Error al buscar la factura.", "error");
        } finally {
            setBuscandoFactura(false);
        }
    };

    const handleAbrirFacturasDespacho = async () => {
        setCargandoFacturas(true);
        setFacturasDialogOpen(true);
        try {
            const lista = await getFacturasParaDespacho();
            setFacturasParaDespacho(lista);
        } catch {
            showMsg("Error al cargar facturas para despacho.", "error");
            setFacturasDialogOpen(false);
        } finally {
            setCargandoFacturas(false);
        }
    };

    const handleSeleccionarFacturaDespacho = (f: MfFacturaParaDespacho) => {
        setOrden((prev) => ({
            ...prev,
            facturaId: f.id,
            facturaSecuencia: f.secuencia,
            clienteId: f.clienteId,
            clienteNombre: f.razonSocial,
        }));
        setNumeroFactura(String(f.secuencia));
        setFacturasDialogOpen(false);
    };

    const handleSelectOrden = ordenSearch.handleSelect(async (resumen: any) => {
        const completo = await getOrdenDespacho(resumen.id);
        setSelectedOrden(completo);
        setOrden(completo);
        setNumeroFactura(String(completo.facturaSecuencia ?? ""));
    });

    const handleSave = async () => {
        if (!orden.facturaId) {
            showMsg("Debe buscar y seleccionar una factura.", "error");
            return;
        }
        if (!orden.fechaCompromiso) {
            showMsg("La fecha de compromiso es obligatoria.", "error");
            return;
        }
        setLoading(true);
        try {
            const saved = await saveOrdenDespacho(orden);
            setSelectedOrden(saved);
            setOrden(saved);
            showMsg("Orden de despacho guardada.");
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarEstado = async (estadoId: string) => {
        if (!selectedOrden?.id) return;
        setLoading(true);
        try {
            const updated = await marcarEstadoOrden(selectedOrden.id, { estadoId });
            setSelectedOrden(updated);
            setOrden(updated);
            showMsg(`Estado actualizado a: ${ESTADO_LABELS[estadoId]?.label ?? estadoId}`);
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al cambiar estado.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAnular = async () => {
        if (!selectedOrden?.id) return;
        if (!window.confirm("¿Anular esta orden de despacho?")) return;
        setLoading(true);
        try {
            await disableOrdenDespacho(selectedOrden.id);
            showMsg("Orden anulada.");
            handleNueva();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al anular.", "error");
        } finally {
            setLoading(false);
        }
    };

    const isEditable = !selectedOrden || selectedOrden.estadoId === "PEN";
    const estadoActual = selectedOrden?.estadoId ?? "";

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Órdenes de Despacho">
                <SearchButton
                    config={SEARCH_CONFIGS.ORDEN_DESPACHO}
                    onOpenSearch={ordenSearch.openModal}
                    variant="button"
                    label="Buscar Orden"
                />
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleNueva}
                    sx={{ backgroundColor: "#272C36", "&:hover": { backgroundColor: "#3d4452" } }}
                >
                    Nueva
                </Button>
            </ActionBar>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Estado actual */}
                    {selectedOrden && (
                        <Grid size={12}>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Orden #{selectedOrden.secuencia} —
                                </Typography>
                                <Chip
                                    label={ESTADO_LABELS[estadoActual]?.label ?? estadoActual}
                                    color={ESTADO_LABELS[estadoActual]?.color ?? "default"}
                                    size="small"
                                />
                                {estadoActual === "EN_RUTA" && (
                                    <Button size="small" onClick={() => handleMarcarEstado("EN_CAMINO")}>
                                        Marcar En Camino
                                    </Button>
                                )}
                                {estadoActual === "EN_CAMINO" && (
                                    <>
                                        <Button size="small" color="success" onClick={() => handleMarcarEstado("ENTREGADO")}>
                                            Marcar Entregado
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleMarcarEstado("DEVUELTO")}>
                                            Marcar Devuelto
                                        </Button>
                                    </>
                                )}
                                {(estadoActual === "PEN" || estadoActual === "EN_RUTA") && (
                                    <Button size="small" color="error" onClick={handleAnular}>
                                        Anular
                                    </Button>
                                )}
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                    )}

                    {/* Búsqueda de factura */}
                    <Grid size={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Factura de Cliente
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
                                <TextField
                                    label="No. de Factura"
                                    size="small"
                                    value={numeroFactura}
                                    onChange={(e) => setNumeroFactura(e.target.value)}
                                    disabled={!isEditable}
                                    onKeyDown={(e) => e.key === "Enter" && handleBuscarFactura()}
                                    sx={{ width: 160 }}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={buscandoFactura ? <CircularProgress size={14} /> : <SearchIcon />}
                                    onClick={handleBuscarFactura}
                                    disabled={!isEditable || buscandoFactura}
                                >
                                    Buscar
                                </Button>
                                {isEditable && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="secondary"
                                        startIcon={<LocalShippingIcon />}
                                        onClick={handleAbrirFacturasDespacho}
                                    >
                                        Facturas para Despacho
                                    </Button>
                                )}
                                {orden.facturaId && (
                                    <Typography variant="body2" color="text.secondary">
                                        ID interno: {orden.facturaId}
                                    </Typography>
                                )}
                            </Box>

                            {/* Info del cliente */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Cliente"
                                        size="small"
                                        fullWidth
                                        value={orden.clienteNombre ?? ""}
                                        InputProps={{ readOnly: true }}
                                        sx={{ "& input": { backgroundColor: "#f5f5f5" } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Tooltip title="Información del cliente proveniente de la factura">
                                        <TextField
                                            label="Teléfono (opcional)"
                                            size="small"
                                            fullWidth
                                            value={orden.clienteTelefono ?? ""}
                                            onChange={(e) =>
                                                setOrden({ ...orden, clienteTelefono: e.target.value })
                                            }
                                            disabled={!isEditable}
                                        />
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Datos del despacho */}
                    <Grid size={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                Datos del Despacho
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Fecha de Compromiso"
                                        type="datetime-local"
                                        size="small"
                                        fullWidth
                                        value={orden.fechaCompromiso?.slice(0, 16) ?? ""}
                                        onChange={(e) =>
                                            setOrden({ ...orden, fechaCompromiso: e.target.value })
                                        }
                                        disabled={!isEditable}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Dirección de Entrega (opcional)"
                                        size="small"
                                        fullWidth
                                        value={orden.direccionEntrega ?? ""}
                                        onChange={(e) =>
                                            setOrden({ ...orden, direccionEntrega: e.target.value })
                                        }
                                        disabled={!isEditable}
                                        placeholder="Ej: Calle 5, Edif. Torre Norte, Apto 3B"
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        label="Notas"
                                        size="small"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={orden.notas ?? ""}
                                        onChange={(e) =>
                                            setOrden({ ...orden, notas: e.target.value })
                                        }
                                        disabled={estadoActual === "ANU"}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Info de asignación */}
                    {selectedOrden?.rutaId && (
                        <Grid size={12}>
                            <Alert severity="info">
                                Esta orden está asignada a la ruta #{selectedOrden.rutaId}.
                                Conductor:{" "}
                                <strong>
                                    {(selectedOrden as any).conductorUsername ?? "—"}
                                </strong>
                                {selectedOrden.fechaEntrega && (
                                    <>
                                        {" | Entregado: "}
                                        <strong>{new Date(selectedOrden.fechaEntrega).toLocaleString("es-DO")}</strong>
                                        {" por "}
                                        <strong>{selectedOrden.usuarioEntrego}</strong>
                                    </>
                                )}
                            </Alert>
                        </Grid>
                    )}

                    {/* Botón guardar */}
                    {isEditable && (
                        <Grid size={12}>
                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={loading || !orden.facturaId}
                                    sx={{ backgroundColor: "#272C36", "&:hover": { backgroundColor: "#3d4452" } }}
                                >
                                    {loading ? <CircularProgress size={20} color="inherit" /> : "Guardar Orden"}
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Modal búsqueda orden */}
            <ModalSearch
                open={ordenSearch.isOpen}
                onClose={ordenSearch.closeModal}
                onSelect={handleSelectOrden}
                config={ordenSearch.config ?? SEARCH_CONFIGS.ORDEN_DESPACHO}
            />

            {/* Diálogo facturas para despacho */}
            <Dialog
                open={facturasDialogOpen}
                onClose={() => setFacturasDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Facturas Pagadas con Envío Pendiente</DialogTitle>
                <DialogContent>
                    {cargandoFacturas ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : facturasParaDespacho.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No hay facturas pagadas con envío pendiente de despacho.
                        </Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#525C71" }}>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>No.</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Fecha</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Cliente</TableCell>
                                    <TableCell sx={{ color: "#fff", fontWeight: 600 }} align="right">Total</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {facturasParaDespacho.map((f) => (
                                    <TableRow
                                        key={f.id}
                                        hover
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => handleSeleccionarFacturaDespacho(f)}
                                    >
                                        <TableCell>{f.secuencia}</TableCell>
                                        <TableCell>
                                            {new Date(f.fechaReg).toLocaleDateString("es-DO")}
                                        </TableCell>
                                        <TableCell>{f.razonSocial}</TableCell>
                                        <TableCell align="right">
                                            {f.total?.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" variant="outlined">
                                                Seleccionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

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

export default DeOrdenDespachoView;
