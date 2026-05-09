import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
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
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
    buscarAlmacenes,
    InAlmacenResumenDTO,
    InAlmacenSearchCriteria,
} from "../../apis/AlmacenController";
import { getSucursales } from "../../apis/SucursalController";
import { SgSucursal } from "../../models/seguridad/SgSucursal";

// -- helpers ------------------------------------------------------------------

const ESTADO_OPCIONES = [
    { value: "", label: "Todos" },
    { value: "ACT", label: "Activo" },
    { value: "INA", label: "Inactivo" },
];

// -- types --------------------------------------------------------------------

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect?: (almacen: InAlmacenResumenDTO) => void;
}

// -- component ----------------------------------------------------------------

const AlmacenBuscarModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
    const [nombre, setNombre] = useState("");
    const [estadoId, setEstadoId] = useState("");
    const [sucursalId, setSucursalId] = useState<number>(0); // 0 = todas
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [resultados, setResultados] = useState<InAlmacenResumenDTO[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        getSucursales().then(setSucursales).catch(() => {});
    }, []);

    const buscar = useCallback(async () => {
        setCargando(true);
        try {
            const criteria: InAlmacenSearchCriteria = {
                nombre: nombre.trim() || undefined,
                estadoId: estadoId || undefined,
                sucursalId: sucursalId === 0 ? undefined : sucursalId,
            };
            const data = await buscarAlmacenes(criteria);
            setResultados(data);
        } catch {
            setResultados([]);
        } finally {
            setCargando(false);
        }
    }, [nombre, estadoId, sucursalId]);

    useEffect(() => {
        if (open) buscar();
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleReset = () => {
        setNombre("");
        setEstadoId("");
        setSucursalId(0);
    };

    const estadoChip = (estado: string) => {
        if (estado === "ACT") return <Chip label="Activo" color="success" size="small" />;
        if (estado === "INA") return <Chip label="Inactivo" color="default" size="small" />;
        return <Chip label={estado} size="small" />;
    };

    const handleRowClick = (row: InAlmacenResumenDTO) => {
        if (onSelect) onSelect(row);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Buscar Almacen
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {/* Filtros */}
                <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Nombre</InputLabel>
                            <OutlinedInput
                                label="Nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscar()}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sucursal</InputLabel>
                            <Select
                                label="Sucursal"
                                value={sucursalId}
                                onChange={(e) => setSucursalId(Number(e.target.value))}
                            >
                                <MenuItem value={0}>Todas</MenuItem>
                                {sucursales.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label="Estado"
                                value={estadoId}
                                onChange={(e) => setEstadoId(e.target.value)}
                            >
                                {ESTADO_OPCIONES.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>
                                        {o.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: "auto" }} sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Limpiar filtros">
                            <IconButton size="small" onClick={handleReset}>
                                <RestartAltIcon />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={
                                cargando ? <CircularProgress size={14} color="inherit" /> : <SearchIcon />
                            }
                            onClick={buscar}
                            disabled={cargando}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>

                {/* Tabla */}
                <TableContainer
                    sx={{ maxHeight: 400, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "8%" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "28%" }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "25%" }}>Ubicacion</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "27%" }}>Sucursal</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.100", width: "12%" }}>Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : resultados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No se encontraron almacenes
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resultados.map((r) => (
                                    <TableRow
                                        key={r.id}
                                        hover
                                        sx={{ cursor: onSelect ? "pointer" : "default" }}
                                        onClick={() => handleRowClick(r)}
                                    >
                                        <TableCell>{r.id}</TableCell>
                                        <TableCell>{r.nombre}</TableCell>
                                        <TableCell sx={{ color: "text.secondary" }}>{r.ubicacion || "—"}</TableCell>
                                        <TableCell>{r.sucursalNombre || "—"}</TableCell>
                                        <TableCell align="center">{estadoChip(r.estadoId)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default AlmacenBuscarModal;
