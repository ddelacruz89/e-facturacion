import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Control, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { NumberInput } from "../../customers/CustomComponents";
import { InOrdenCompraFormDTO } from "../../models/inventario";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { Box, TextField } from "@mui/material";

interface OrdenCompraDetalleFormProps {
    control: Control<InOrdenCompraFormDTO>;
    index: number;
    errors: FieldErrors<InOrdenCompraFormDTO>;
    setValue: UseFormSetValue<InOrdenCompraFormDTO>;
    watch: UseFormWatch<InOrdenCompraFormDTO>;
}

const OrdenCompraDetalleForm: React.FC<OrdenCompraDetalleFormProps> = ({ control, index, errors, setValue, watch }) => {
    const [selectedProducto, setSelectedProducto] = useState<any>(null);

    // Modal search for productos
    const productoSearch = useModalSearch();

    const handleProductoSelect = productoSearch.handleSelect((producto: any) => {
        setSelectedProducto(producto);
        setValue(`detalles.${index}.productoId`, producto.id);
    });

    // Watch fields for calculations
    const cantidad = watch(`detalles.${index}.cantidad`);
    const precioUnitario = watch(`detalles.${index}.precioUnitario`);
    const itbisProducto = watch(`detalles.${index}.itbisProducto`);
    const descuentoPorciento = watch(`detalles.${index}.descuentoPorciento`);
    const descuentoCantidad = watch(`detalles.${index}.descuentoCantidad`);

    useEffect(() => {
        // Update producto name display
        if (selectedProducto) {
            setValue(`detalles.${index}.productoNombre` as any, selectedProducto.nombreProducto || "");
        }
    }, [selectedProducto, index, setValue]);

    useEffect(() => {
        // Calculate subtotal, itbis, and total whenever relevant fields change
        if (cantidad && precioUnitario) {
            const baseSubtotal = cantidad * precioUnitario;

            // Apply discount
            let finalSubtotal = baseSubtotal;
            if (descuentoCantidad) {
                finalSubtotal = baseSubtotal - descuentoCantidad;
            } else if (descuentoPorciento) {
                finalSubtotal = baseSubtotal - baseSubtotal * (descuentoPorciento / 100);
            }

            setValue(`detalles.${index}.subTotal`, finalSubtotal);

            // Calculate ITBIS
            const itbisValue = finalSubtotal * ((itbisProducto || 0) / 100);
            setValue(`detalles.${index}.itbis`, itbisValue);

            // Calculate total
            const total = finalSubtotal + itbisValue;
            setValue(`detalles.${index}.total`, total);
        }
    }, [cantidad, precioUnitario, itbisProducto, descuentoPorciento, descuentoCantidad, index, setValue]);

    const detalleErrors = errors.detalles?.[index];

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" gap={1} alignItems="flex-start">
                    <TextField
                        fullWidth
                        label="Producto"
                        value={selectedProducto?.nombreProducto || ""}
                        size="small"
                        disabled
                        error={!!detalleErrors?.productoId}
                        helperText={detalleErrors?.productoId?.message}
                    />
                    <SearchButton
                        config={SEARCH_CONFIGS.PRODUCTO}
                        onOpenSearch={productoSearch.openModal}
                        variant="icon"
                        tooltip="Buscar Producto"
                    />
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Unidad" value={selectedProducto?.unidadNombre || ""} size="small" disabled />
            </Grid>

            <NumberInput
                control={control}
                name={`detalles.${index}.cantidad` as any}
                label="Cantidad"
                error={detalleErrors?.cantidad}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.cantidadTablar` as any}
                label="Cantidad Tablar"
                error={detalleErrors?.cantidadTablar}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.precioUnitario` as any}
                label="Precio Unitario"
                error={detalleErrors?.precioUnitario}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.itbisProducto` as any}
                label="ITBIS %"
                error={detalleErrors?.itbisProducto}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.descuentoPorciento` as any}
                label="Descuento %"
                error={detalleErrors?.descuentoPorciento}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.descuentoCantidad` as any}
                label="Descuento RD$"
                error={detalleErrors?.descuentoCantidad}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.subTotal` as any}
                label="Subtotal"
                error={detalleErrors?.subTotal}
                size={3}
                disabled={true}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.itbis` as any}
                label="ITBIS"
                error={detalleErrors?.itbis}
                size={3}
                disabled={true}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.total` as any}
                label="Total"
                error={detalleErrors?.total}
                size={4}
                disabled={true}
            />

            {/* Modal Search for Producto */}
            {productoSearch.config && (
                <ModalSearch
                    open={productoSearch.isOpen}
                    onClose={productoSearch.closeModal}
                    config={productoSearch.config}
                    initialValues={productoSearch.initialValues}
                    onSelect={handleProductoSelect}
                />
            )}
        </Grid>
    );
};

export default OrdenCompraDetalleForm;
