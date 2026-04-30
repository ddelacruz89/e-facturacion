import React, { useState } from "react";
import {
    Button,
    Divider,
    Grid,
    Snackbar,
    Alert,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from "@mui/material";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { getLote, updateLote, getStockPorAlmacen, InLoteStockResponseDTO } from "../../apis/LoteController";
import { InLote, InLoteUpdateDTO } from "../../models/inventario";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";

const emptyForm: InLoteUpdateDTO = {
    serie: false,
    fechaVencimiento: null,
    fechaAlertaVencimiento: null,
    alertasDias: null,
    estadoId: "ACT",
};

export const LoteView: React.FC = () => {
    const loteSearch = useModalSearch();

    const [selectedLote, setSelectedLote] = useState<InLote | null>(null);
    // productoId guardado del resumen (entero puro) — más fiable que selectedLote.productoId?.id
    const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
    const [form, setForm] = useState<InLoteUpdateDTO>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [stockData, setStockData] = useState<InLoteStockResponseDTO | null>(null);
    const [loadingStock, setLoadingStock] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    const showSnackbar = (message: string, severity: "success" | "error") =>
        setSnackbar({ open: true, message, severity });

    // ── Selección desde modal ─────────────────────────────────────────────────
    const handleLoteSelect = loteSearch.handleSelect(async (resumen: any) => {
        const productoId: number = resumen.productoId;
        try {
            const completo = await getLote(resumen.lote, productoId);
            setSelectedLote(completo);
            setSelectedProductoId(productoId);
            setForm({
                serie: completo.serie ?? false,
                fechaVencimiento: completo.fechaVencimiento
                    ? completo.fechaVencimiento.toString().split("T")[0]
                    : null,
                fechaAlertaVencimiento: completo.fechaAlertaVencimiento
                    ? completo.fechaAlertaVencimiento.toString().split("T")[0]
                    : null,
                alertasDias: completo.alertasDias ?? null,
                estadoId: completo.estadoId ?? "ACT",
            });
            setStockData(null);
        } catch {
            showSnackbar("Error al cargar el lote", "error");
        }
    });

    // ── Guardar cambios ───────────────────────────────────────────────────────
    const handleGuardar = async () => {
        if (!selectedLote || !selectedProductoId) return;

        setLoading(true);
        try {
            const updated = await updateLote(selectedLote.lote, selectedProductoId, form);
            setSelectedLote(updated);
            showSnackbar("Lote actualizado correctamente", "success");
        } catch {
            showSnackbar("Error al actualizar el lote", "error");
        } finally {
            setLoading(false);
        }
    };

    // ── Stock por almacén ─────────────────────────────────────────────────────
    const handleVerStock = async () => {
        if (!selectedLote || !selectedProductoId) return;
        setLoadingStock(true);
        setStockData(null);
        try {
            const data = await getStockPorAlmacen(selectedLote.lote, selectedProductoId);
            setStockData(data);
        } catch {
            showSnackbar("Error al consultar el stock", "error");
        } finally {
            setLoadingStock(false);
        }
    };

    // ── Limpiar ───────────────────────────────────────────────────────────────
    const handleLimpiar = () => {
        setSelectedLote(null);
        setSelectedProductoId(null);
        setForm(emptyForm);
        setStockData(null);
    };

    const handleChange = (field: keyof InLoteUpdateDTO, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    // ── Lógica de fechas/días ─────────────────────────────────────────────────
    /** Suma N días a un string "YYYY-MM-DD" y devuelve "YYYY-MM-DD". */
    const addDays = (dateStr: string, days: number): string => {
        const d = new Date(dateStr + "T00:00:00");
        d.setDate(d.getDate() + days);
        return d.toISOString().split("T")[0];
    };

    /** Diferencia en días entre dos strings "YYYY-MM-DD" (b - a). */
    const diffDays = (a: string, b: string): number => {
        const msA = new Date(a + "T00:00:00").getTime();
        const msB = new Date(b + "T00:00:00").getTime();
        return Math.round((msB - msA) / 86400000);
    };

    const handleFechaVencimientoChange = (value: string | null) => {
        if (!value) {
            // Al borrar fecha vencimiento, limpiar dependientes
            setForm((prev) => ({
                ...prev,
                fechaVencimiento: null,
                fechaAlertaVencimiento: null,
                alertasDias: null,
            }));
            return;
        }
        // Si ya hay días configurados, recalcular fecha alerta
        setForm((prev) => {
            const dias = prev.alertasDias;
            return {
                ...prev,
                fechaVencimiento: value,
                fechaAlertaVencimiento: dias != null ? addDays(value, dias) : prev.fechaAlertaVencimiento,
            };
        });
    };

    const handleAlertasDiasChange = (value: number | null) => {
        setForm((prev) => {
            const fv = prev.fechaVencimiento;
            return {
                ...prev,
                alertasDias: value,
                fechaAlertaVencimiento: fv && value != null ? addDays(fv, value) : prev.fechaAlertaVencimiento,
            };
        });
    };

    const handleFechaAlertaChange = (value: string | null) => {
        setForm((prev) => {
            const fv = prev.fechaVencimiento;
            return {
                ...prev,
                fechaAlertaVencimiento: value,
                alertasDias: fv && value ? diffDays(fv, value) : prev.alertasDias,
            };
        });
    };

    // ── Formato de cantidad con conversión unidad/fracción ────────────────────
    /**
     * Convierte fracciones a "X cajas Y unidades (Z unidades)".
     * Si fraccionCantidad <= 1 o no hay unidad, muestra solo el número.
     */
    const formatCantidadConUnidad = (
        cantidad: number,
        fraccionCantidad: number,
        unidadNombre: string | null,
        fraccionNombre: string | null,
    ): string => {
        const totalStr = cantidad.toLocaleString("es-DO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const cantidadStr = Number.isInteger(cantidad) ? String(cantidad) : totalStr;

        // Sin conversión: mostrar cantidad + nombre de fracción (si existe)
        if (!unidadNombre || fraccionCantidad <= 1) {
            return fraccionNombre ? `${cantidadStr} ${fraccionNombre}` : totalStr;
        }

        const cajas = Math.floor(cantidad / fraccionCantidad);
        const resto = cantidad % fraccionCantidad;
        const fNombre = fraccionNombre ?? "unidades";

        if (cajas === 0) {
            return `${resto} ${fNombre} (${totalStr})`;
        } else if (resto === 0) {
            return `${cajas} ${unidadNombre} (${totalStr} ${fNombre})`;
        } else {
            return `${cajas} ${unidadNombre} ${resto} ${fNombre} (${totalStr})`;
        }
    };

    const esSerie = !!form.serie;
    const tieneFechaVencimiento = !!form.fechaVencimiento;

    return (
        <>
            <ActionBar title="Lotes">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGuardar}
                    disabled={!selectedLote || !selectedProductoId || loading}>
                    Guardar
                </Button>
                <Button variant="outlined" onClick={handleLimpiar}>
                    Limpiar
                </Button>
            </ActionBar>

            <Box sx={{ padding: 2.5 }}>
                {/* ── Buscador ── */}
                <Grid container spacing={2} alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Button
                            variant="outlined"
                            startIcon={<SearchIcon />}
                            fullWidth
                            onClick={() => loteSearch.openModal(SEARCH_CONFIGS.LOTE)}>
                            Buscar Lote
                        </Button>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                {/* ── Info del lote seleccionado ── */}
                {selectedLote ? (
                    <>
                        <Box
                            sx={{
                                mb: 2,
                                p: 1.5,
                                bgcolor: "grey.50",
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "grey.300",
                                display: "flex",
                                gap: 3,
                                flexWrap: "wrap",
                                alignItems: "center",
                            }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Lote
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {selectedLote.lote}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Producto
                                </Typography>
                                <Typography variant="body1">
                                    {selectedLote.productoId?.nombreProducto ?? `ID ${selectedLote.productoId?.id}`}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Registrado por
                                </Typography>
                                <Typography variant="body1">{selectedLote.usuarioReg ?? "-"}</Typography>
                            </Box>
                            <Chip
                                label={selectedLote.estadoId === "ACT" ? "Activo" : selectedLote.estadoId}
                                color={selectedLote.estadoId === "ACT" ? "success" : "default"}
                                size="small"
                                icon={<EditIcon />}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={loadingStock ? <CircularProgress size={14} /> : <InventoryIcon />}
                                onClick={handleVerStock}
                                disabled={loadingStock}>
                                Ver Stock
                            </Button>
                        </Box>

                        {/* ── Formulario de edición ── */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={form.estadoId ?? "ACT"}
                                        label="Estado"
                                        onChange={(e) => handleChange("estadoId", e.target.value)}>
                                        <MenuItem value="ACT">Activo</MenuItem>
                                        <MenuItem value="INA">Inactivo</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Serie</InputLabel>
                                    <Select
                                        value={form.serie ? "true" : "false"}
                                        label="Serie"
                                        onChange={(e) => {
                                            const esSer = e.target.value === "true";
                                            // Al marcar como serie, limpiar fechas
                                            setForm((prev) => ({
                                                ...prev,
                                                serie: esSer,
                                                ...(esSer
                                                    ? {
                                                          fechaVencimiento: null,
                                                          fechaAlertaVencimiento: null,
                                                          alertasDias: null,
                                                      }
                                                    : {}),
                                            }));
                                        }}>
                                        <MenuItem value="false">No (Lote)</MenuItem>
                                        <MenuItem value="true">Sí (Serie)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Fecha de Vencimiento"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={esSerie}
                                    value={form.fechaVencimiento ?? ""}
                                    onChange={(e) => handleFechaVencimientoChange(e.target.value || null)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Días de Alerta"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    disabled={esSerie || !tieneFechaVencimiento}
                                    value={form.alertasDias ?? ""}
                                    onChange={(e) =>
                                        handleAlertasDiasChange(
                                            e.target.value ? Number(e.target.value) : null,
                                        )
                                    }
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Fecha Alerta Vencimiento"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={esSerie || !tieneFechaVencimiento}
                                    value={form.fechaAlertaVencimiento ?? ""}
                                    onChange={(e) => handleFechaAlertaChange(e.target.value || null)}
                                />
                            </Grid>
                        </Grid>

                        {/* ── Tabla de stock por almacén ── */}
                        {stockData !== null && (
                            <Box mt={3}>
                                <Divider sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Stock por almacén — lote {selectedLote.lote}
                                        {stockData.unidadNombre && stockData.fraccionCantidad > 1 && (
                                            <> &nbsp;·&nbsp; 1 {stockData.unidadNombre} = {stockData.fraccionCantidad} {stockData.fraccionNombre}</>
                                        )}
                                    </Typography>
                                </Divider>
                                {stockData.almacenes.length === 0 ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        textAlign="center"
                                        py={2}>
                                        No hay existencias para este lote
                                    </Typography>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "grey.100" }}>
                                                    <TableCell>Almacén</TableCell>
                                                    <TableCell align="right">
                                                        Cantidad
                                                        {stockData.unidadNombre && stockData.fraccionCantidad > 1 && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {stockData.unidadNombre} / {stockData.fraccionNombre}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stockData.almacenes.map((row) => (
                                                    <TableRow key={row.almacenId} hover>
                                                        <TableCell>{row.almacenNombre}</TableCell>
                                                        <TableCell align="right">
                                                            {formatCantidadConUnidad(
                                                                row.cantidad,
                                                                stockData.fraccionCantidad,
                                                                stockData.unidadNombre,
                                                                stockData.fraccionNombre,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow sx={{ bgcolor: "grey.50" }}>
                                                    <TableCell>
                                                        <strong>Total</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>
                                                            {formatCantidadConUnidad(
                                                                stockData.almacenes.reduce((s, r) => s + r.cantidad, 0),
                                                                stockData.fraccionCantidad,
                                                                stockData.unidadNombre,
                                                                stockData.fraccionNombre,
                                                            )}
                                                        </strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        )}
                    </>
                ) : (
                    <Box py={4} textAlign="center">
                        <Typography color="text.secondary">
                            Busca un lote para ver y editar su información
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Modal búsqueda */}
            {loteSearch.config && (
                <ModalSearch
                    open={loteSearch.isOpen}
                    onClose={loteSearch.closeModal}
                    onSelect={handleLoteSelect}
                    config={loteSearch.config}
                    initialValues={loteSearch.initialValues}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LoteView;
