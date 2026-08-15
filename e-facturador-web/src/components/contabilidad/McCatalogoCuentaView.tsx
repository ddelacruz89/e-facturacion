import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    IconButton,
    Paper,
    Snackbar,
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ActionBar from "../../customers/ActionBar";
import { McCatalogoCuentaNodoDTO } from "../../models/contabilidad/McCatalogoCuenta";
import {
    buscarRaices,
    buscarHijos,
    desactivarCuenta,
    activarCuenta,
} from "../../apis/McCatalogoCuentaController";
import McCatalogoCuentaFormDialog from "./McCatalogoCuentaFormDialog";

const formatSaldo = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return "";
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── FilaCuenta (recursiva) ──────────────────────────────────────────────────

interface FilaCuentaProps {
    nodo: McCatalogoCuentaNodoDTO;
    depth: number;
    onEdit: (id: number) => void;
    onAddChild: (padre: McCatalogoCuentaNodoDTO) => void;
    onToggleEstado: (nodo: McCatalogoCuentaNodoDTO) => void;
    refreshToken: number;
}

const FilaCuenta: React.FC<FilaCuentaProps> = ({ nodo, depth, onEdit, onAddChild, onToggleEstado, refreshToken }) => {
    const [open, setOpen] = useState(false);
    const [hijos, setHijos] = useState<McCatalogoCuentaNodoDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const loaded = useRef(false);

    const cargarHijos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await buscarHijos(nodo.id);
            setHijos(data);
            loaded.current = true;
        } finally {
            setLoading(false);
        }
    }, [nodo.id]);

    // Si se guardó una sub-cuenta nueva de este nodo, recargar hijos (solo si ya estaban expandidos).
    useEffect(() => {
        if (open) {
            loaded.current = false;
            cargarHijos();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshToken]);

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next && !loaded.current) cargarHijos();
    };

    const inactiva = nodo.estadoId === "INA";

    return (
        <>
            <TableRow
                hover
                sx={{
                    "& td": { py: 0.6 },
                    opacity: inactiva ? 0.55 : 1,
                }}
            >
                <TableCell sx={{ width: 40 }}>
                    {nodo.tieneHijos ? (
                        <IconButton size="small" onClick={handleToggle}>
                            {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                        </IconButton>
                    ) : null}
                </TableCell>
                <TableCell sx={{ pl: depth * 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                            {nodo.cuenta}
                        </Typography>
                        <Typography variant="body2">{nodo.nombreCuenta}</Typography>
                        {!nodo.permiteMovimiento && (
                            <Chip label="Resumen" size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                        )}
                        {inactiva && (
                            <Chip
                                label="Inactiva"
                                size="small"
                                sx={{ height: 18, fontSize: 10, bgcolor: "#f5f5f5", color: "#757575" }}
                            />
                        )}
                        {loading && <CircularProgress size={12} />}
                    </Box>
                </TableCell>
                <TableCell sx={{ width: 140 }}>
                    <Typography variant="body2" color="text.secondary">
                        {nodo.tipoCuentaNombre}
                    </Typography>
                </TableCell>
                <TableCell align="right" sx={{ width: 130 }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                        {formatSaldo(nodo.saldoCuenta)}
                    </Typography>
                </TableCell>
                <TableCell align="right" sx={{ width: 150 }}>
                    {!nodo.permiteMovimiento && (
                        <Tooltip title="Agregar sub-cuenta">
                            <IconButton size="small" onClick={() => onAddChild(nodo)}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(nodo.id)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={inactiva ? "Reactivar" : "Desactivar"}>
                        <IconButton size="small" onClick={() => onToggleEstado(nodo)}>
                            {inactiva ? <CheckCircleOutlineIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>

            {nodo.tieneHijos && (
                <TableRow sx={{ p: 0 }}>
                    <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Table size="small">
                                <TableBody>
                                    {hijos.map((h) => (
                                        <FilaCuenta
                                            key={h.id}
                                            nodo={h}
                                            depth={depth + 1}
                                            onEdit={onEdit}
                                            onAddChild={onAddChild}
                                            onToggleEstado={onToggleEstado}
                                            refreshToken={refreshToken}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

// ── componente principal ──────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const McCatalogoCuentaView: React.FC = () => {
    const [raices, setRaices] = useState<McCatalogoCuentaNodoDTO[]>([]);
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [snackOpen, setSnackOpen] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [padreSeleccionado, setPadreSeleccionado] = useState<McCatalogoCuentaNodoDTO | null>(null);

    const cargarRaices = useCallback(async (targetPage: number) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const result = await buscarRaices(targetPage, PAGE_SIZE);
            setRaices(result.content);
            setTotalElements(result.totalElements);
            setPage(targetPage);
        } catch {
            setErrorMsg("Error al consultar el catálogo de cuentas.");
            setSnackOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const mountLoadDone = useRef(false);
    useEffect(() => {
        if (mountLoadDone.current) return;
        mountLoadDone.current = true;
        cargarRaices(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = (_: unknown, newPage: number) => cargarRaices(newPage);

    const abrirNuevaRaiz = () => {
        setEditId(null);
        setPadreSeleccionado(null);
        setDialogOpen(true);
    };

    const abrirNuevaSubcuenta = (padre: McCatalogoCuentaNodoDTO) => {
        setEditId(null);
        setPadreSeleccionado(padre);
        setDialogOpen(true);
    };

    const abrirEdicion = (id: number) => {
        setEditId(id);
        setPadreSeleccionado(null);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        cargarRaices(page);
        setRefreshToken((t) => t + 1);
    };

    const handleToggleEstado = async (nodo: McCatalogoCuentaNodoDTO) => {
        try {
            if (nodo.estadoId === "INA") {
                await activarCuenta(nodo.id);
            } else {
                await desactivarCuenta(nodo.id);
            }
            cargarRaices(page);
            setRefreshToken((t) => t + 1);
        } catch {
            setErrorMsg("No se pudo cambiar el estado de la cuenta.");
            setSnackOpen(true);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <ActionBar title="Contabilidad — Catálogo de Cuentas">
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={abrirNuevaRaiz}
                    sx={{ bgcolor: "#3D4453", "&:hover": { bgcolor: "#2e3340" } }}
                >
                    Nueva cuenta raíz
                </Button>
            </ActionBar>

            <Paper elevation={1} sx={{ p: 1.5, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <AccountTreeIcon sx={{ color: "#525C71" }} />
                <Typography variant="body2" color="text.secondary">
                    Árbol jerárquico del plan de cuentas. Expande una cuenta para ver sus sub-cuentas.
                </Typography>
            </Paper>

            <TableContainer component={Paper} elevation={2}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#272C36" }}>
                            <TableCell sx={{ width: 40, border: 0 }} />
                            <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Cuenta</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 140 }}>Tipo</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 130 }} align="right">
                                Saldo
                            </TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 150 }} align="right">
                                Acciones
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : raices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                    Sin cuentas registradas. Crea la primera cuenta raíz.
                                </TableCell>
                            </TableRow>
                        ) : (
                            raices.map((r) => (
                                <FilaCuenta
                                    key={r.id}
                                    nodo={r}
                                    depth={0}
                                    onEdit={abrirEdicion}
                                    onAddChild={abrirNuevaSubcuenta}
                                    onToggleEstado={handleToggleEstado}
                                    refreshToken={refreshToken}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={PAGE_SIZE}
                rowsPerPageOptions={[PAGE_SIZE]}
                labelRowsPerPage="Por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count} cuentas raíz`}
                disabled={loading}
            />

            <McCatalogoCuentaFormDialog
                open={dialogOpen}
                padre={padreSeleccionado}
                editId={editId}
                onClose={() => setDialogOpen(false)}
                onSaved={handleSaved}
            />

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="error" onClose={() => setSnackOpen(false)}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default McCatalogoCuentaView;
