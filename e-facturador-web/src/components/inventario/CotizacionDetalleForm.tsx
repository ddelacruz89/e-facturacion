import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Control, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TextInput, NumberInput } from "../../customers/CustomComponents";
import { InCotizacionFormDTO } from "../../models/inventario";
import { SearchableComboBox } from "../../customers/SearchableComboBox";
import { getSuplidores } from "../../apis/SuplidorController";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";
import { Box } from "@mui/material";

interface CotizacionDetalleFormProps {
    control: Control<InCotizacionFormDTO>;
    index: number;
    errors: FieldErrors<InCotizacionFormDTO>;
    setValue: UseFormSetValue<InCotizacionFormDTO>;
    watch: UseFormWatch<InCotizacionFormDTO>;
}

const CotizacionDetalleForm: React.FC<CotizacionDetalleFormProps> = ({ control, index, errors, setValue, watch }) => {
    const [suplidores, setSuplidores] = useState<any[]>([]);
    const [selectedProducto, setSelectedProducto] = useState<any>(null);

    // Modal search for productos
    const productoSearch = useModalSearch();

    const handleProductoSelect = productoSearch.handleSelect((producto: any) => {
        setSelectedProducto(producto);
        setValue(`detalles.${index}.productoId`, producto.id);
        // Set precio venta if available
        if (producto.precioVenta) {
            setValue(`detalles.${index}.precioVenta`, producto.precioVenta);
        }
    });

    // Watch fields for calculations
    const cantidad = watch(`detalles.${index}.cantidad`);
    const precioCompra = watch(`detalles.${index}.precioCompra`);
    const itbisPorciento = watch(`detalles.${index}.itbisPorciento`);

    useEffect(() => {
        loadSuplidores();
    }, []);

    useEffect(() => {
        // Update producto name display
        if (selectedProducto) {
            setValue(`detalles.${index}.productoNombre` as any, selectedProducto.nombreProducto || "");
        }
    }, [selectedProducto, index, setValue]);

    useEffect(() => {
        // Calculate subTotal, itbis, and total whenever relevant fields change
        if (cantidad && precioCompra) {
            const subTotal = cantidad * precioCompra;
            setValue(`detalles.${index}.subTotal`, subTotal);

            const itbisValue = subTotal * ((itbisPorciento || 0) / 100);
            setValue(`detalles.${index}.itbis`, itbisValue);

            const total = subTotal + itbisValue;
            setValue(`detalles.${index}.total`, total);
        }
    }, [cantidad, precioCompra, itbisPorciento, index, setValue]);

    const loadSuplidores = async () => {
        try {
            const data = await getSuplidores();
            setSuplidores(data);
        } catch (error) {
            console.error("Error loading suplidores:", error);
        }
    };

    const detalleErrors = errors.detalles?.[index];

    // Convert suplidor options to ComboBoxOption format
    const suplidorOptions = suplidores.map((s) => ({
        value: s.id,
        label: s.nombre || "",
        ...s,
    }));

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" gap={1} alignItems="center">
                    <TextInput
                        control={control}
                        name={`detalles.${index}.productoNombre` as any}
                        label="Producto"
                        error={detalleErrors?.productoId}
                        size={10}
                        disabled
                        readOnly
                    />
                    <SearchButton
                        config={SEARCH_CONFIGS.PRODUCTO}
                        onOpenSearch={productoSearch.openModal}
                        variant="icon"
                        tooltip="Buscar Producto"
                    />
                </Box>
            </Grid>

            <SearchableComboBox
                name={`detalles.${index}.suplidorId`}
                control={control}
                label="Suplidor"
                options={suplidorOptions}
                error={detalleErrors?.suplidorId}
                size={6}
            />

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
                name={`detalles.${index}.cantidadPedida` as any}
                label="Cantidad Pedida"
                error={detalleErrors?.cantidadPedida}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.itbisPorciento` as any}
                label="ITBIS %"
                error={detalleErrors?.itbisPorciento}
                size={3}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.precioCompra` as any}
                label="Precio Compra"
                error={detalleErrors?.precioCompra}
                size={4}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.precioVenta` as any}
                label="Precio Venta"
                error={detalleErrors?.precioVenta}
                size={4}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.subTotal` as any}
                label="Subtotal"
                error={detalleErrors?.subTotal}
                size={4}
                disabled={true}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.itbis` as any}
                label="ITBIS"
                error={detalleErrors?.itbis}
                size={6}
                disabled={true}
            />

            <NumberInput
                control={control}
                name={`detalles.${index}.total` as any}
                label="Total"
                error={detalleErrors?.total}
                size={6}
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

export default CotizacionDetalleForm;
