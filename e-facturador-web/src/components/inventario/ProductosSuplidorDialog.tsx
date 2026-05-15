import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    Divider,
    Alert,
    Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { ConfirmationModal } from "../../customers/CustomComponents";
import { ModalSearch } from "../search/ModalSearch";
import { useModalSearch } from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import {
    getProductosBySuplidor,
    addProductoToSuplidor,
    updateProductoPrecio,
    removeProductoFromSuplidor,
    InSuplidorProductoResumenDTO,
} from "../../apis/SuplidorController";

interface Props {
    open: boolean;
    onClose: () => void;
    suplidorId: number;
    suplidorNombre: string;
}

export const ProductosSuplidorDialog: React.FC<Props> = ({
    open,
    onClose,
    suplidorId,
    suplidorNombre,
}) => {
    // ── Productos ────────────────────────────────────────────────────────────
    const [productos, setProductos] = useState<InSuplidorProductoResumenDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Búsqueda de producto ─────────────────────────────────────────────────
    const productoSearch = useModalSearch();

    // ── Dialog de precio ─────────────────────────────────────────────────────
    const [showPrecioDialog, setShowPrecioDialog] = useState(false);
    const [precioMode, setPrecioMode] = useState<"add" | "edit">("add");
    const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
    const [selectedProductoNombre, setSelectedProductoNombre] = useState("");
    const [selectedSupProdId, setSelectedSupProdId] = useState<number | null>(null);
    const [precioInput, setPrecioInput] = useState("");
    const [saving, setSaving] = useState(false);

    // ── Confirmación eliminar ────────────────────────────────────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ── Snackbar ─────────────────────────────────────────────────────────────
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");
    const [snackSev, setSnackSev] = useState<"success" | "error" | "info" | "warning">("success");

    const showSnack = (msg: string, sev: "success" | "error" | "info" | "warning" = "success") => {
        setSnackMsg(msg);
        setSnackSev(sev);
        setSnackOpen(true);
    };

    // ── Carga de productos ───────────────────────────────────────────────────
    const loadProductos = async () => {
        setLoading(true);
        try {
            const data = await getProductosBySuplidor(suplidorId);
            setProductos(data);
        } catch {
            showSnack("Error al cargar los productos", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) loadProductos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    /** Selección de producto desde el modal de búsqueda → pide precio */
    const handleProductoSelect = productoSearch.handleSelect((prod: any) => {
        setSelectedProductoId(prod.id);
        setSelectedProductoNombre(prod.nombreProducto || prod.nombre || `ID: ${prod.id}`);
        setPrecioInput("");
        setPrecioMode("add");
        setSelectedSupProdId(null);
        setShowPrecioDialog(true);
    });

    /** Editar precio de un producto ya asignado */
    const handleEditPrecio = (item: InSuplidorProductoResumenDTO) => {
        setSelectedProductoId(item.productoId);
        setSelectedProductoNombre(item.productoNombre);
        setSelectedSupProdId(item.id);
        setPrecioInput(String(item.precio));
        setPrecioMode("edit");
        setShowPrecioDialog(true);
    };

    /** Confirmar guardar precio (agregar o editar) */
    const handleConfirmPrecio = async () => {
        const precio = parseFloat(precioInput);
        if (isNaN(precio) || precio <= 0) {
            showSnack("Ingrese un precio válido mayor a 0", "error");
            return;
        }
        setSaving(true);
        try {
            if (precioMode === "add" && selectedProductoId !== null) {
                await addProductoToSuplidor(suplidorId, { productoId: selectedProductoId, precio });
                showSnack("Producto agregado exitosamente");
            } else if (selectedSupProdId !== null && selectedProductoId !== null) {
                await updateProductoPrecio(suplidorId, selectedSupProdId, {
                    productoId: selectedProductoId,
                    precio,
                });
                showSnack("Precio actualizado exitosamente");
            }
            setShowPrecioDialog(false);
            await loadProductos();
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || "Error al guardar";
            showSnack(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    /** Confirmar eliminación */
    const handleConfirmDelete = async () => {
        if (deletingId === null) return;
        try {
            await removeProductoFromSuplidor(suplidorId, deletingId);
            showSnack("Producto eliminado");
            setShowDeleteModal(false);
            setDeletingId(null);
            await loadProductos();
        } catch {
            showSnack("Error al eliminar el producto", "error");
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Productos del Suplidor —{" "}
                            <Typography component="span" variant="h6" color="primary">
                                {suplidorNombre}
                            </Typography>
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ pt: 2 }}>
                    {/* Botón agregar */}
                    <Box display="flex" justifyContent="flex-end" mb={1.5}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => productoSearch.openModal(SEARCH_CONFIGS.PRODUCTO_COMPRA)}>
                            Agregar Producto
                        </Button>
                    </Box>

                    {/* Tabla de productos */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                                        <TableCell width="10%">ID Producto</TableCell>
                                        <TableCell width="55%">Nombre</TableCell>
                                        <TableCell width="20%" align="right">
                                            Precio Compra
                                        </TableCell>
                                        <TableCell width="15%" align="center">
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {productos.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                align="center"
                                                sx={{ py: 4, color: "text.secondary" }}>
                                                Sin productos asignados. Haga clic en "Agregar Producto" para comenzar.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        productos.map((p) => (
                                            <TableRow key={p.id} hover>
                                                <TableCell>{p.productoId}</TableCell>
                                                <TableCell>{p.productoNombre}</TableCell>
                                                <TableCell align="right">
                                                    {Number(p.precio).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        title="Editar precio"
                                                        onClick={() => handleEditPrecio(p)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        title="Quitar producto"
                                                        onClick={() => {
                                                            setDeletingId(p.id);
                                                            setShowDeleteModal(true);
                                                        }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} color="secondary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal búsqueda de producto */}
            {productoSearch.config && (
                <ModalSearch
                    open={productoSearch.isOpen}
                    onClose={productoSearch.closeModal}
                    onSelect={handleProductoSelect}
                    config={productoSearch.config}
                    initialValues={productoSearch.initialValues}
                />
            )}

            {/* Dialog de precio */}
            <Dialog
                open={showPrecioDialog}
                onClose={() => setShowPrecioDialog(false)}
                maxWidth="xs"
                fullWidth>
                <DialogTitle>
                    {precioMode === "add" ? "Agregar Producto" : "Editar Precio de Compra"}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {selectedProductoNombre}
                    </Typography>
                    <TextField
                        label="Precio de Compra"
                        type="number"
                        fullWidth
                        size="small"
                        value={precioInput}
                        onChange={(e) => setPrecioInput(e.target.value)}
                        inputProps={{ min: 0, step: "0.01" }}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleConfirmPrecio()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPrecioDialog(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmPrecio}
                        variant="contained"
                        color="primary"
                        disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmación eliminar */}
            <ConfirmationModal
                open={showDeleteModal}
                title="Quitar Producto"
                message="¿Está seguro de que desea quitar este producto del suplidor?"
                confirmText="Quitar"
                cancelText="Cancelar"
                confirmColor="error"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setDeletingId(null);
                }}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert
                    onClose={() => setSnackOpen(false)}
                    severity={snackSev}
                    sx={{ width: "100%" }}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProductosSuplidorDialog;
