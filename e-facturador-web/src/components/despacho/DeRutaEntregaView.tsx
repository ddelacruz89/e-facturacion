import React, { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
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
import AssignmentIcon from "@mui/icons-material/Assignment";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import {
    DeOrdenDespachoResumen,
    DeRutaEntrega,
    DeRutaEntregaResumen,
    DeRutaZona,
    MfFacturaParaDespacho,
} from "../../models/despacho/DespachoModels";
import {
    addZonaARuta,
    asignarFacturasARuta,
    cambiarEstadoRuta,
    disableRutaEntrega,
    getZonasDeRuta,
    getRutaEntrega,
    removeZonaDeRuta,
    saveRutaEntrega,
} from "../../apis/DeRutaEntregaController";
import { buscarOrdenesDespacho } from "../../apis/DeOrdenDespachoController";
import { getFacturasParaDespacho } from "../../apis/FacturaController";
import { getVehiculosActivos } from "../../apis/DeVehiculoController";
import { DeVehiculo } from "../../models/despacho/DespachoModels";
import UserSelectorField from "../shared/UserSelectorField";
import {
    getProvincias,
    getMunicipiosByProvincia,
    getBarriosByMunicipio,
    MgProvincia,
    MgMunicipioResumen,
    MgBarrioParajeResumen,
} from "../../apis/UbicacionController";
import ReciboViewer from "./ReciboViewer";

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
    const [reciboViewer, setReciboViewer] = useState<DeOrdenDespachoResumen | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    // Zonas geográficas
    const [zonas, setZonas] = useState<DeRutaZona[]>([]);
    const [provincias, setProvincias] = useState<MgProvincia[]>([]);
    const [municipios, setMunicipios] = useState<MgMunicipioResumen[]>([]);
    const [barrios, setBarrios] = useState<MgBarrioParajeResumen[]>([]);
    const [selProvincia, setSelProvincia] = useState<MgProvincia | null>(null);
    const [selMunicipio, setSelMunicipio] = useState<MgMunicipioResumen | null>(null);
    const [selBarrio, setSelBarrio] = useState<MgBarrioParajeResumen | null>(null);
    const [loadingZona, setLoadingZona] = useState(false);

    const rutaSearch = useModalSearch();

    useEffect(() => {
        getVehiculosActivos().then(setVehiculos).catch(console.error);
        getProvincias().then(setProvincias).catch(console.error);
    }, []);

    useEffect(() => {
        if (selProvincia) {
            getMunicipiosByProvincia(selProvincia.codProvincia)
                .then(setMunicipios)
                .catch(console.error);
            setSelMunicipio(null);
            setSelBarrio(null);
            setBarrios([]);
        } else {
            setMunicipios([]);
            setSelMunicipio(null);
            setSelBarrio(null);
            setBarrios([]);
        }
    }, [selProvincia]);

    useEffect(() => {
        if (selMunicipio) {
            getBarriosByMunicipio(selMunicipio.id)
                .then(setBarrios)
                .catch(console.error);
            setSelBarrio(null);
        } else {
            setBarrios([]);
            setSelBarrio(null);
        }
    }, [selMunicipio]);

    const cargarFacturasDespacho = (rutaId?: number) => {
        getFacturasParaDespacho(rutaId).then(setFacturasParaDespacho).catch(console.error);
    };

    const cargarOrdenesDeRuta = (rutaId: number) => {
        buscarOrdenesDespacho({ rutaId, page: 0, size: 100 })
            .then((result: any) => setOrdenesAsignadas(Array.isArray(result) ? result : (result?.content ?? [])))
            .catch(console.error);
    };

    const cargarZonasDeRuta = (rutaId: number) => {
        getZonasDeRuta(rutaId).then(setZonas).catch(console.error);
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
        setZonas([]);
        setSelProvincia(null);
    };

    const handleSelectRuta = rutaSearch.handleSelect(async (resumen: any) => {
        const completo = await getRutaEntrega(resumen.id);
        setSelectedRuta(completo);
        setRuta(completo);
        setFacturasSeleccionadas(new Set());
        cargarOrdenesDeRuta(resumen.id);
        cargarZonasDeRuta(resumen.id);
        cargarFacturasDespacho(resumen.id);
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
            cargarFacturasDespacho(saved.id);
            if (saved.id) cargarZonasDeRuta(saved.id);
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAgregarZona = async () => {
        if (!selectedRuta?.id || !selProvincia || !selMunicipio) {
            showMsg("Seleccione al menos provincia y municipio.", "error");
            return;
        }
        setLoadingZona(true);
        try {
            const zona: DeRutaZona = {
                codProvincia: selProvincia.codProvincia,
                municipioId: selMunicipio.id,
                barrioId: selBarrio?.id ?? null,
            };
            await addZonaARuta(selectedRuta.id, zona);
            cargarZonasDeRuta(selectedRuta.id);
            cargarFacturasDespacho(selectedRuta.id);
            // Reset only barrio; keep provincia+municipio for adding more barrios
            setSelBarrio(null);
            showMsg("Zona agregada.");
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al agregar zona.", "error");
        } finally {
            setLoadingZona(false);
        }
    };

    const handleEliminarZona = async (zonaId: number) => {
        if (!selectedRuta?.id) return;
        try {
            await removeZonaDeRuta(selectedRuta.id, zonaId);
            cargarZonasDeRuta(selectedRuta.id);
            cargarFacturasDespacho(selectedRuta.id);
            showMsg("Zona eliminada.");
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al eliminar zona.", "error");
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
            cargarFacturasDespacho(selectedRuta.id);
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
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al anular.", "error");
        } finally {
            setLoading(false);
        }
    };

    const estadoRuta = selectedRuta?.estadoId ?? "";
    const isEditable = !selectedRuta || estadoRuta === "PLANIFICADA";
    const tieneEntregadas = ordenesAsignadas.some((o) => o.estadoId === "ENTREGADO");
    const zonaEditable = selectedRuta && (estadoRuta === "PLANIFICADA" || estadoRuta === "EN_CURSO");

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Rutas de Entrega">
                <SearchButton
                    config={SEARCH_CONFIGS.RUTA_ENTREGA}
                    onOpenSearch={rutaSearch.openModal}
                    variant="button"
                    buttonVariant="contained"
                    label="Buscar Ruta"
                    sx={{ bgcolor: "#526671", "&:hover": { bgcolor: "#3d4e56" } }}
                />
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleNueva}
                    sx={{ bgcolor: "#715D52", "&:hover": { bgcolor: "#55463e" } }}
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
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleCambiarEstado("EN_CURSO")}
                                        sx={{ bgcolor: "#527158", "&:hover": { bgcolor: "#3c5541" } }}
                                    >
                                        Iniciar Ruta
                                    </Button>
                                )}
                                {estadoRuta === "EN_CURSO" && (
                                    <>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleCambiarEstado("COMPLETADA")}
                                            sx={{ bgcolor: "#527158", "&:hover": { bgcolor: "#3c5541" } }}
                                        >
                                            Completar Ruta
                                        </Button>
                                        {!tieneEntregadas && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleCambiarEstado("PLANIFICADA")}
                                                sx={{ bgcolor: "#716752", "&:hover": { bgcolor: "#554e3d" } }}
                                            >
                                                Regresar a Planificada
                                            </Button>
                                        )}
                                    </>
                                )}
                                {(estadoRuta === "PLANIFICADA" || estadoRuta === "EN_CURSO") && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleAnular}
                                        sx={{ bgcolor: "#71526B", "&:hover": { bgcolor: "#553f51" } }}
                                    >
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
                                        soloChoferes
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

                    {/* Zonas geográficas — visible cuando hay una ruta seleccionada */}
                    {selectedRuta && (
                        <Grid size={12}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                    <PlaceIcon fontSize="small" sx={{ color: "text.secondary" }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                                        Zonas Geográficas
                                    </Typography>
                                    <Chip
                                        label={zonas.length === 0 ? "Sin filtro — todas las ubicaciones" : `${zonas.length} zona(s)`}
                                        size="small"
                                        color={zonas.length > 0 ? "primary" : "default"}
                                        variant="outlined"
                                    />
                                </Box>

                                {/* Tabla de zonas existentes */}
                                {zonas.length > 0 && (
                                    <Table size="small" sx={{ mb: 2 }}>
                                        <TableHead>
                                            <TableRow sx={{ "& th": { fontWeight: 600, py: 0.75, fontSize: "0.75rem", color: "text.secondary" } }}>
                                                <TableCell>Provincia</TableCell>
                                                <TableCell>Municipio</TableCell>
                                                <TableCell>Barrio / Paraje</TableCell>
                                                {zonaEditable && <TableCell align="center" sx={{ width: 48 }} />}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {zonas.map((z) => (
                                                <TableRow key={z.id} sx={{ "&:last-child td": { border: 0 } }}>
                                                    <TableCell sx={{ py: 0.5 }}>{z.provinciaNombre ?? z.codProvincia}</TableCell>
                                                    <TableCell sx={{ py: 0.5 }}>{z.municipioNombre ?? z.municipioId}</TableCell>
                                                    <TableCell sx={{ py: 0.5 }}>
                                                        {z.barrioId
                                                            ? z.barrioNombre ?? `#${z.barrioId}`
                                                            : <Typography variant="caption" color="text.secondary">Todos</Typography>
                                                        }
                                                    </TableCell>
                                                    {zonaEditable && (
                                                        <TableCell align="center" sx={{ py: 0.5 }}>
                                                            <Tooltip title="Eliminar zona">
                                                                <IconButton size="small" onClick={() => handleEliminarZona(z.id!)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {/* Selector para agregar zona — solo en estados editables */}
                                {zonaEditable && (
                                    <>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                            Agregar zona: seleccione provincia, municipio y opcionalmente barrio/paraje
                                        </Typography>
                                        <Grid container spacing={1.5} alignItems="center">
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={provincias}
                                                    getOptionLabel={(p) => p.nombre}
                                                    value={selProvincia}
                                                    onChange={(_, v) => setSelProvincia(v)}
                                                    renderInput={(params) => <TextField {...params} label="Provincia" />}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={municipios}
                                                    getOptionLabel={(m) => m.nombre}
                                                    value={selMunicipio}
                                                    onChange={(_, v) => setSelMunicipio(v)}
                                                    disabled={!selProvincia}
                                                    renderInput={(params) => <TextField {...params} label="Municipio" />}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={barrios}
                                                    getOptionLabel={(b) => b.nombre}
                                                    value={selBarrio}
                                                    onChange={(_, v) => setSelBarrio(v)}
                                                    disabled={!selMunicipio}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Barrio / Paraje"
                                                            placeholder="Todos los barrios"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    fullWidth
                                                    startIcon={loadingZona ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                                                    onClick={handleAgregarZona}
                                                    disabled={loadingZona || !selProvincia || !selMunicipio}
                                                    sx={{ bgcolor: "#526671", "&:hover": { bgcolor: "#3d4e56" } }}
                                                >
                                                    Agregar
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {!zonaEditable && zonas.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        Sin restricción geográfica — se muestran clientes de todas las ubicaciones.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    )}

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
                                                <TableCell align="center">Recibo</TableCell>
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
                                                    <TableCell align="center" sx={{ py: 0.5 }}>
                                                        {o.reciboUrl ? (
                                                            <Tooltip title="Ver recibo de entrega">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setReciboViewer(o)}
                                                                    sx={{ color: "#2563eb" }}
                                                                >
                                                                    <ReceiptLongIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <Typography variant="caption" color="text.disabled">—</Typography>
                                                        )}
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
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Facturas para Despacho — Asignar a esta Ruta
                                        </Typography>
                                        {zonas.length > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Filtradas por zonas geográficas de la ruta
                                            </Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AssignmentIcon />}
                                        onClick={handleAsignarFacturas}
                                        disabled={loading || facturasSeleccionadas.size === 0}
                                        sx={{ bgcolor: "#5F5271", "&:hover": { bgcolor: "#483e56" } }}
                                    >
                                        Asignar ({facturasSeleccionadas.size})
                                    </Button>
                                </Box>
                                {facturasParaDespacho.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {zonas.length > 0
                                            ? "No hay facturas pendientes de clientes en las zonas definidas."
                                            : "No hay facturas pagadas con envío pendiente de asignar."}
                                    </Typography>
                                ) : (
                                    facturasParaDespacho.map((f) => (
                                        <Box
                                            key={f.id}
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 1,
                                                py: 0.75,
                                                borderBottom: "1px solid #f0f0f0",
                                            }}
                                        >
                                            <Checkbox
                                                size="small"
                                                checked={facturasSeleccionadas.has(f.id)}
                                                onChange={() => toggleFactura(f.id)}
                                                sx={{ mt: -0.25 }}
                                            />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2">
                                                    <strong>Factura #{f.secuencia}</strong> — {f.razonSocial}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color={f.direccionEntrega ? "text.secondary" : "text.disabled"}
                                                    sx={{ display: "block", mt: 0.25, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                >
                                                    📍 {f.direccionEntrega ?? "Sin dirección registrada"}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(f.fechaReg).toLocaleDateString("es-DO")}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    RD$ {f.total?.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </Box>
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

            {reciboViewer && reciboViewer.reciboUrl && (
                <ReciboViewer
                    ordenId={reciboViewer.id}
                    reciboUrl={reciboViewer.reciboUrl}
                    clienteNombre={reciboViewer.clienteNombre}
                    onClose={() => setReciboViewer(null)}
                />
            )}

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
