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
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
    buscarMunicipios,
    MgMunicipioResumen,
    MgMunicipioSearchCriteria,
} from "../../apis/UbicacionController";

const PAGE_SIZE = 50;

interface Props {
    open: boolean;
    onClose: () => void;
    /** ID del municipio padre — filtra los Distritos Municipales hijos */
    parentId: number | undefined;
    onSelect: (municipio: MgMunicipioResumen) => void;
}

const MunicipioBuscarModal: React.FC<Props> = ({
    open,
    onClose,
    parentId,
    onSelect,
}) => {
    const [descripcion, setDescripcion] = useState("");
    const [resultados, setResultados] = useState<MgMunicipioResumen[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [cargando, setCargando] = useState(false);

    const buscar = useCallback(
        async (p = 0) => {
            setCargando(true);
            try {
                const criteria: MgMunicipioSearchCriteria = {
                    parentId: parentId ?? undefined,
                    nombre: descripcion.trim() || undefined,
                    page: p,
                    size: PAGE_SIZE,
                };
                const data = await buscarMunicipios(criteria);
                setResultados(data.content);
                setTotalElements(data.totalElements);
                setPage(p);
            } catch {
                setResultados([]);
                setTotalElements(0);
            } finally {
                setCargando(false);
            }
        },
        [parentId, descripcion]
    );

    useEffect(() => {
        if (open) {
            setDescripcion("");
            setPage(0);
            buscar(0);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleReset = () => {
        setDescripcion("");
        buscar(0);
    };

    const handleRowClick = (row: MgMunicipioResumen) => {
        onSelect(row);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Buscar Municipio
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {/* Filtros */}
                <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Descripción</InputLabel>
                            <OutlinedInput
                                label="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscar(0)}
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
                            onClick={() => buscar(0)}
                            disabled={cargando}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>

                {/* Tabla */}
                <TableContainer
                    sx={{ maxHeight: 340, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100", width: "22%" }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>Municipio</TableCell>
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
                                        No se encontraron municipios
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resultados.map((r) => (
                                    <TableRow
                                        key={r.id}
                                        hover
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => handleRowClick(r)}
                                    >
                                        <TableCell>{r.codOne}</TableCell>
                                        <TableCell>{r.nombre}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {totalElements} resultado{totalElements !== 1 ? "s" : ""}
                    </Typography>
                    <TablePagination
                        component="div"
                        count={totalElements}
                        page={page}
                        onPageChange={(_e, newPage) => buscar(newPage)}
                        rowsPerPage={PAGE_SIZE}
                        rowsPerPageOptions={[PAGE_SIZE]}
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                        sx={{ "& .MuiToolbar-root": { minHeight: 36 } }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default MunicipioBuscarModal;
