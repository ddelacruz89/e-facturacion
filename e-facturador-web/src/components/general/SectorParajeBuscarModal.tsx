import React, { useEffect, useState } from "react";
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
    getBarriosByMunicipio,
    MgBarrioParajeResumen,
} from "../../apis/UbicacionController";

interface Props {
    open: boolean;
    onClose: () => void;
    municipioId: number | undefined;
    onSelect: (barrio: MgBarrioParajeResumen) => void;
}

const SectorParajeBuscarModal: React.FC<Props> = ({ open, onClose, municipioId, onSelect }) => {
    const [todos, setTodos] = useState<MgBarrioParajeResumen[]>([]);
    const [filtro, setFiltro] = useState("");
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!open || !municipioId) { setTodos([]); return; }
        setCargando(true);
        setFiltro("");
        getBarriosByMunicipio(municipioId)
            .then(setTodos)
            .finally(() => setCargando(false));
    }, [open, municipioId]);

    const resultados = filtro.trim()
        ? todos.filter((b) => b.nombre.toLowerCase().includes(filtro.toLowerCase()))
        : todos;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Buscar Barrio / Paraje</Typography>
                <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <OutlinedInput
                        placeholder="Filtrar..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        startAdornment={<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>}
                    />
                </FormControl>
                <TableContainer sx={{ maxHeight: 380, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Barrio / Paraje</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "28%" }}>Envío</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
                            ) : resultados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        {!municipioId ? "Seleccione un municipio primero" : "Sin resultados"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resultados.map((r) => (
                                    <TableRow key={r.id} hover sx={{ cursor: "pointer" }} onClick={() => { onSelect(r); onClose(); }}>
                                        <TableCell>{r.nombre}</TableCell>
                                        <TableCell sx={{ color: "text.secondary" }}>
                                            {r.precioEnvio != null ? `RD$${Number(r.precioEnvio).toFixed(2)}` : "—"}
                                        </TableCell>
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

export default SectorParajeBuscarModal;
