import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    OutlinedInput,
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
import { getProvincias, MgProvincia } from "../../apis/UbicacionController";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (provincia: MgProvincia) => void;
}

const ProvinciaBuscarModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
    const [descripcion, setDescripcion] = useState("");
    const [todas, setTodas] = useState<MgProvincia[]>([]);
    const [resultados, setResultados] = useState<MgProvincia[]>([]);
    const [cargando, setCargando] = useState(false);

    // Carga la lista completa una sola vez
    useEffect(() => {
        if (!open || todas.length > 0) return;
        setCargando(true);
        getProvincias()
            .then((data) => {
                setTodas(data);
                setResultados(data);
            })
            .catch(() => setResultados([]))
            .finally(() => setCargando(false));
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filtro local (solo 32 registros, no necesita ir al servidor)
    const filtrar = useCallback(() => {
        const txt = descripcion.trim().toUpperCase();
        setResultados(
            txt ? todas.filter((p) => p.nombre?.toUpperCase().includes(txt)) : todas
        );
    }, [descripcion, todas]);

    const handleReset = () => {
        setDescripcion("");
        setResultados(todas);
    };

    const handleRowClick = (row: MgProvincia) => {
        onSelect(row);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Buscar Provincia
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {/* Filtro */}
                <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Descripción</InputLabel>
                            <OutlinedInput
                                label="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && filtrar()}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: "auto" }} sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Limpiar">
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
                            onClick={filtrar}
                            disabled={cargando}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>

                {/* Tabla */}
                <TableContainer
                    sx={{ maxHeight: 380, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "20%" }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Provincia</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : resultados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No se encontraron provincias
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resultados.map((r) => (
                                    <TableRow
                                        key={r.codProvincia}
                                        hover
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => handleRowClick(r)}
                                    >
                                        <TableCell>{r.codProvincia}</TableCell>
                                        <TableCell>{r.nombre}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProvinciaBuscarModal;
