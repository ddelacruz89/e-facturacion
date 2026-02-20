import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, FieldErrors, useFieldArray, Controller } from "react-hook-form";
import {
    Box,
    Grid,
    Button,
    Typography,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Snackbar,
    Alert,
    Switch,
    Chip,
    Autocomplete,
    TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { AlphanumericInput, NumericInput, MoneyInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { saveProducto, getProducto } from "../../apis/ProductoController";
import searchService from "../../services/searchService";
import { MgProducto, MgUnidad } from "../../models/producto";
import { InAlmacen } from "../../models/inventario";
import { SgMenu } from "../../models/seguridad";

// Import the new modal search components
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../../types/modalSearchTypes";

// Import the new ComboBox components
import {
    CategoriaComboBox,
    UnidadComboBox,
    ItbisComboBox,
    AlmacenComboBox,
    MenuComboBox,
    SuplidorComboBox,
    TagComboBox,
} from "../../customers/ProductComboBoxes";

const ProductoViewExample = () => {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<MgProducto>({
        defaultValues: {
            empresaId: 0,
            secuencia: 0,
            usuarioReg: "",
            fechaReg: new Date(),
            activo: true,
            nombreProducto: "",
            descripcion: "",
            codigoBarra: "",
            trabajador: false,
            comision: 0,
            itbisId: 0,
            categoriaId: 0,
            unidadProductorSuplidor: [],
            productosModulos: [],
            tags: [],
        },
    });

    const {
        fields: unidadProductorSuplidor,
        append: appendUnidad,
        remove: removeUnidad,
    } = useFieldArray({
        control,
        name: "unidadProductorSuplidor",
    });

    // State to manage expanded cards for unidad/fracción items
    const [expandedCards, setExpandedCards] = useState<{ [key: number]: boolean }>({});

    // State to track duplicate rows
    const [duplicateRows, setDuplicateRows] = useState<Set<number>>(new Set());

    // State for selected product (to display in search input)
    const [selectedProduct, setSelectedProduct] = useState<MgProducto | null>(null);

    // State for tags functionality
    const [availableTags, setAvailableTags] = useState<Array<{ id: number; nombre: string }>>([
        { id: 1, nombre: "Electrónicos" },
        { id: 2, nombre: "Hogar" },
        { id: 3, nombre: "Deportes" },
        { id: 4, nombre: "Ropa" },
        { id: 5, nombre: "Libros" },
    ]);
    const [selectedTags, setSelectedTags] = useState<Array<{ id: number; nombre: string }>>([]);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({
        open: false,
        message: "",
        severity: "info",
    });

    // Modal search hook
    const modalSearch = useModalSearch();

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info") => {
        setSnackbar({ open: true, message, severity });
    };

    // Validar que la combinación unidadId + cantidad + unidadFraccionId sea única
    const validateUnidadCombination = (currentIndex: number, unidadId: any, cantidad: any, unidadFraccionId: any): boolean => {
        // Extraer el ID del objeto verificando si tiene propiedades en lugar de usar typeof
        const unidadIdValue = (unidadId && (unidadId.id || unidadId.value)) || unidadId;
        const unidadFraccionIdValue = (unidadFraccionId && (unidadFraccionId.id || unidadFraccionId.value)) || unidadFraccionId;
        const cantidadValue = Number(cantidad) || 0; // Convertir a número

        // Si alguno es 0 o undefined, no validar aún
        if (
            !unidadIdValue ||
            !unidadFraccionIdValue ||
            unidadIdValue === 0 ||
            unidadFraccionIdValue === 0 ||
            cantidadValue === 0
        ) {
            return true;
        }

        // Verificar todas las combinaciones duplicadas en el array completo
        const allUnidades = watch("unidadProductorSuplidor");
        const duplicateIndexes = new Set<number>();

        allUnidades.forEach((unidad, idx) => {
            const existingUnidadId =
                (unidad.unidadId && ((unidad.unidadId as any).id || (unidad.unidadId as any).value)) || unidad.unidadId;
            const existingUnidadFraccionId =
                (unidad.unidadFraccionId && ((unidad.unidadFraccionId as any).id || (unidad.unidadFraccionId as any).value)) ||
                unidad.unidadFraccionId;
            const existingCantidad = Number(unidad.cantidad) || 0;

            // Si esta fila tiene valores completos
            if (existingUnidadId && existingUnidadFraccionId && existingCantidad > 0) {
                // Buscar si hay otra fila con la misma combinación
                const hasDuplicate = allUnidades.some((otherUnidad, otherIdx) => {
                    if (idx === otherIdx) return false;

                    const otherUnidadId =
                        (otherUnidad.unidadId && ((otherUnidad.unidadId as any).id || (otherUnidad.unidadId as any).value)) ||
                        otherUnidad.unidadId;
                    const otherUnidadFraccionId =
                        (otherUnidad.unidadFraccionId &&
                            ((otherUnidad.unidadFraccionId as any).id || (otherUnidad.unidadFraccionId as any).value)) ||
                        otherUnidad.unidadFraccionId;
                    const otherCantidad = Number(otherUnidad.cantidad) || 0;

                    return (
                        existingUnidadId === otherUnidadId &&
                        existingCantidad === otherCantidad &&
                        existingUnidadFraccionId === otherUnidadFraccionId
                    );
                });

                if (hasDuplicate) {
                    duplicateIndexes.add(idx);
                }
            }
        });

        // Actualizar el estado de duplicados
        setDuplicateRows(duplicateIndexes);

        // Mostrar mensaje si hay duplicados
        if (duplicateIndexes.size > 0) {
            showSnackbar("Hay combinaciones duplicadas de Unidad Base, Cantidad y Unidad Fracción", "warning");
            return false;
        }

        return true;
    };

    const toggleCardExpansion = (index: number) => {
        setExpandedCards((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Function to clear the form and search
    const clearForm = () => {
        setSelectedProduct(null);
        reset({
            empresaId: 0,
            secuencia: 0,
            usuarioReg: "",
            fechaReg: new Date(),
            activo: true,
            nombreProducto: "",
            descripcion: "",
            codigoBarra: "",
            trabajador: false,
            comision: 0,
            itbisId: 0,
            categoriaId: 0,
            unidadProductorSuplidor: [],
            productosModulos: [],
            tags: [],
        });
    };

    // Handle product selection from modal search
    const handleProductSelect = modalSearch.handleSelect((product) => {
        // Update the selected product state for display (cast to MgProducto)
        setSelectedProduct(product as MgProducto);

        // Load the selected product into the form
        reset({
            ...product,
            // Ensure arrays exist
            unidadProductorSuplidor: product.unidadProductorSuplidor || [],
            productosModulos: product.productosModulos || [],
            tags: product.tags || [],
        });

        console.log("Producto seleccionado desde modal:", product);
    });

    const {
        fields: productModulos,
        append: appendProductoModulo,
        remove: removeProductoModulo,
    } = useFieldArray({
        control,
        name: "productosModulos",
    });

    const {
        fields: productTags,
        append: appendProductoTag,
        remove: removeProductoTag,
    } = useFieldArray({
        control,
        name: "tags",
    });

    const onSubmit: SubmitHandler<MgProducto> = (data) => {
        console.log("Raw form data:", data);

        // Transform ComboBox objects - keep categoria and itbis objects
        const transformedData: MgProducto = {
            ...data,
            // Keep the complete categoria object instead of just ID
            categoriaId:
                typeof data.categoriaId === "object" && data.categoriaId !== null
                    ? (data.categoriaId as any) // Send the complete {id, name, description} object
                    : data.categoriaId,
            // Keep the complete itbis object instead of just ID
            itbisId:
                typeof data.itbisId === "object" && data.itbisId !== null
                    ? (data.itbisId as any) // Send the complete {id, name, description} object
                    : data.itbisId,

            // Transform nested arrays - keep unidad objects
            unidadProductorSuplidor: data.unidadProductorSuplidor?.map((item) => ({
                ...item,
                // Keep the complete unidad objects instead of just IDs
                unidadId:
                    typeof item.unidadId === "object" && item.unidadId !== null
                        ? (item.unidadId as any) // Send the complete {id, name, description} object
                        : item.unidadId,
                unidadFraccionId:
                    typeof item.unidadFraccionId === "object" && item.unidadFraccionId !== null
                        ? (item.unidadFraccionId as any) // Send the complete {id, name, description} object
                        : item.unidadFraccionId,
                productosSuplidores: item.productosSuplidores?.map((suplidor) => ({
                    ...suplidor,
                    // Keep the complete suplidor object instead of just ID
                    suplidorId:
                        typeof suplidor.suplidorId === "object" && suplidor.suplidorId !== null
                            ? (suplidor.suplidorId as any) // Send the complete {id, name, description} object
                            : suplidor.suplidorId,
                })),
            })),
        };

        console.log("Transformed data for API:", transformedData);

        const isUpdate = transformedData.id && transformedData.id > 0;
        const successMessage = isUpdate ? "Producto actualizado correctamente" : "Producto creado correctamente";

        saveProducto(transformedData)
            .then((response) => {
                showSnackbar(successMessage, "success");
                // Actualizar el producto seleccionado con la respuesta del servidor
                setSelectedProduct(response);

                // Actualizar solo los campos básicos sin recargar los combos
                if (response.id) setValue("id", response.id);
                if (response.secuencia) setValue("secuencia", response.secuencia);
                if (response.fechaReg) setValue("fechaReg", response.fechaReg);
            })
            .catch((error) => {
                console.error("Error al guardar el producto:", error);
                showSnackbar("Error al guardar el producto", "error");
            });
    };

    const onError = (errors: FieldErrors<MgProducto>) => {
        console.log("Errores de validación:", errors);
    };

    const addUnidadFraccion = () => {
        appendUnidad({
            empresaId: 0,
            secuencia: 0,
            usuarioReg: "",
            fechaReg: new Date(),
            activo: true,
            cantidad: 1,
            precioVenta: 0,
            precioMinimo: 0,
            disponibleEnCompra: true,
            disponibleEnVenta: true,
            existencia: 0,
            precioCostoAvg: 0,
            precio: 0,
            unidadId: 0,
            unidadFraccionId: 0,
            productoId: 0,
            productosSuplidores: [],
            productosAlmacenesLimites: [],
        });

        // Auto-expand the newly added card
        const newIndex = unidadProductorSuplidor.length; // Will be the index of the new item
        setExpandedCards((prev) => ({
            ...prev,
            [newIndex]: true,
        }));
    };

    const addProductoModulo = () => {
        appendProductoModulo({
            empresaId: 0,
            secuencia: 0,
            usuarioReg: "",
            fechaReg: new Date(),
            activo: true,
            sgMenuId: 0,
        });
    };

    const addProductoTag = () => {
        appendProductoTag({
            empresaId: 0,
            secuencia: 0,
            usuarioReg: "",
            fechaReg: new Date(),
            activo: true,
            productoId: 0,
            tagId: 0,
        });
    };

    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Producto">
                    <Button
                        size="small"
                        sx={{
                            color: "white", // White text
                            backgroundColor: "#1976d2", // Example background
                            "&:hover": {
                                backgroundColor: "#1565c0",
                            },
                        }}
                        type="submit">
                        Guardar
                    </Button>
                    <Button
                        size="small"
                        sx={{
                            color: "white", // White text
                            backgroundColor: "#1976d2", // Example background
                            "&:hover": {
                                backgroundColor: "#1565c0",
                            },
                        }}
                        type="button"
                        onClick={clearForm}>
                        Nuevo
                    </Button>
                </ActionBar>

                <section>
                    {/* Basic Information */}
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Información Básica
                            </Typography>
                            <Grid container spacing={2}>
                                <Box sx={{ width: `${(3 / 12) * 100}%`, mb: 2 }}>
                                    <SearchButton
                                        config={SEARCH_CONFIGS.PRODUCTO}
                                        onOpenSearch={modalSearch.openModal}
                                        variant="input"
                                        size="small"
                                        label="Buscar Producto"
                                        displayValue={selectedProduct?.id || ""}
                                        placeholder="Seleccione un producto..."
                                        initialValues={{ estado: "activo" }}
                                    />
                                </Box>
                                <AlphanumericInput
                                    label="Código de Barra"
                                    size={3}
                                    name="codigoBarra"
                                    control={control}
                                    error={errors.codigoBarra}
                                />

                                <AlphanumericInput
                                    label="Nombre del Producto"
                                    size={6}
                                    name="nombreProducto"
                                    control={control}
                                    error={errors.nombreProducto}
                                    rules={{
                                        required: "Campo requerido",
                                        minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                    }}
                                />
                            </Grid>

                            <Grid container spacing={2}>
                                <AlphanumericInput
                                    label="Descripción"
                                    size={12}
                                    name="descripcion"
                                    control={control}
                                    error={errors.descripcion}
                                />
                            </Grid>

                            {/* Using the new SearchableComboBox components */}
                            <Grid container spacing={2}>
                                <CategoriaComboBox
                                    name="categoriaId"
                                    control={control}
                                    error={errors.categoriaId as any}
                                    rules={{ required: "Seleccione una categoría" }}
                                    size={6}
                                    onSelectionChange={(value) => {
                                        console.log("Categoria selected:", value);
                                    }}
                                />
                                <ItbisComboBox
                                    name="itbisId"
                                    control={control}
                                    error={errors.itbisId as any}
                                    rules={{ required: "Seleccione un ITBIS" }}
                                    size={6}
                                    onSelectionChange={(value) => {
                                        console.log("ITBIS selected:", value);
                                    }}
                                />
                            </Grid>

                            {/* Configuración General del Producto */}
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                Configuración General
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={watch("activo")}
                                            onChange={(e) => setValue("activo", e.target.checked)}
                                        />
                                    }
                                    label="Activo"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={watch("trabajador")}
                                            onChange={(e) => setValue("trabajador", e.target.checked)}
                                        />
                                    }
                                    label="Es trabajador"
                                />
                                {watch("trabajador") && (
                                    <Box sx={{ minWidth: 200 }}>
                                        <MoneyInput
                                            label="Comisión"
                                            size={12}
                                            name="comision"
                                            control={control}
                                            error={errors.comision}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Unit Fractions with Pricing and Inventory */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                Unidades, Precios e Inventario ({unidadProductorSuplidor.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Cada unidad puede tener diferentes precios de venta e inventario independiente.
                                </Typography>
                                <Button variant="outlined" size="small" onClick={addUnidadFraccion}>
                                    Agregar Unidad/Fracción
                                </Button>
                            </Box>

                            {unidadProductorSuplidor.map((field, index) => {
                                const isActive = watch(`unidadProductorSuplidor.${index}.activo`);
                                const isDuplicate = duplicateRows.has(index);

                                return (
                                    <Card
                                        key={field.id}
                                        variant="outlined"
                                        sx={{
                                            mb: 2,
                                            border: isDuplicate ? "2px solid #ffcdd2" : undefined,
                                            backgroundColor: isDuplicate ? "#ffebee" : !isActive ? "#f5f5f5" : undefined,
                                            opacity: isActive ? 1 : 0.6,
                                            transition: "all 0.3s ease",
                                        }}>
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="flex-end">
                                                <UnidadComboBox
                                                    name={`unidadProductorSuplidor.${index}.unidadId`}
                                                    label="Unidad Base"
                                                    control={control}
                                                    size={3}
                                                    disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                    onSelectionChange={(value: any) => {
                                                        setTimeout(() => {
                                                            const cantidad = watch(`unidadProductorSuplidor.${index}.cantidad`);
                                                            const unidadFraccionId = watch(
                                                                `unidadProductorSuplidor.${index}.unidadFraccionId`,
                                                            );
                                                            validateUnidadCombination(index, value, cantidad, unidadFraccionId);
                                                        }, 50);
                                                    }}
                                                />
                                                <Box sx={{ mb: 0, "& > div": { mb: 0 } }}>
                                                    <NumericInput
                                                        label="Cantidad"
                                                        name={`unidadProductorSuplidor.${index}.cantidad`}
                                                        control={control}
                                                        size={12}
                                                        disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                        onBlur={(value: any) => {
                                                            const unidadId = watch(`unidadProductorSuplidor.${index}.unidadId`);
                                                            const unidadFraccionId = watch(
                                                                `unidadProductorSuplidor.${index}.unidadFraccionId`,
                                                            );
                                                            validateUnidadCombination(index, unidadId, value, unidadFraccionId);
                                                        }}
                                                    />
                                                </Box>
                                                <UnidadComboBox
                                                    name={`unidadProductorSuplidor.${index}.unidadFraccionId`}
                                                    label="Unidad Fracción"
                                                    control={control}
                                                    size={3}
                                                    disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                    onSelectionChange={(value: any) => {
                                                        setTimeout(() => {
                                                            const unidadId = watch(`unidadProductorSuplidor.${index}.unidadId`);
                                                            const cantidad = watch(`unidadProductorSuplidor.${index}.cantidad`);
                                                            validateUnidadCombination(index, unidadId, cantidad, value);
                                                        }, 50);
                                                    }}
                                                />{" "}
                                                {/* Action buttons in the same row, aligned to the right */}
                                                <Grid
                                                    size={{ xs: 12, sm: "auto" }}
                                                    sx={{ marginLeft: "auto", display: "flex", gap: 1, alignItems: "center" }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={watch(`unidadProductorSuplidor.${index}.activo`)}
                                                                onChange={(e) =>
                                                                    setValue(
                                                                        `unidadProductorSuplidor.${index}.activo`,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                                size="small"
                                                            />
                                                        }
                                                        label="Activo"
                                                        labelPlacement="top"
                                                        sx={{
                                                            margin: 0,
                                                            "& .MuiFormControlLabel-label": {
                                                                fontSize: "0.75rem",
                                                                lineHeight: 1,
                                                            },
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleCardExpansion(index)}
                                                        sx={{
                                                            transform: expandedCards[index] ? "rotate(180deg)" : "rotate(0deg)",
                                                            transition: "transform 0.3s",
                                                        }}>
                                                        <ExpandMoreIcon />
                                                    </IconButton>
                                                    {/* Solo mostrar botón eliminar si no ha sido guardado (no tiene ID) */}
                                                    {!watch(`unidadProductorSuplidor.${index}.id`) && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => removeUnidad(index)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </Grid>
                                            </Grid>

                                            {/* Expandable sections */}
                                            {expandedCards[index] && (
                                                <>
                                                    {/* Precios e Inventario */}
                                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                                        Precios e Inventario
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <MoneyInput
                                                            label="Precio de Venta"
                                                            name={`unidadProductorSuplidor.${index}.precioVenta`}
                                                            control={control}
                                                            size={2}
                                                            disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                        />
                                                        <MoneyInput
                                                            label="Precio Mínimo"
                                                            name={`unidadProductorSuplidor.${index}.precioMinimo`}
                                                            control={control}
                                                            size={2}
                                                            disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                        />
                                                        <MoneyInput
                                                            label="Precio de Costo"
                                                            name={`unidadProductorSuplidor.${index}.precio`}
                                                            control={control}
                                                            size={2}
                                                            disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                        />
                                                        <MoneyInput
                                                            label="Precio Costo Promedio"
                                                            name={`unidadProductorSuplidor.${index}.precioCostoAvg`}
                                                            control={control}
                                                            size={2}
                                                            disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                        />
                                                        <NumericInput
                                                            label="Existencia"
                                                            name={`unidadProductorSuplidor.${index}.existencia`}
                                                            control={control}
                                                            size={2}
                                                            disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                        />
                                                    </Grid>

                                                    {/* Opciones de Disponibilidad */}
                                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                                        Disponibilidad
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={watch(
                                                                        `unidadProductorSuplidor.${index}.disponibleEnCompra`,
                                                                    )}
                                                                    disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                                    onChange={(e) =>
                                                                        setValue(
                                                                            `unidadProductorSuplidor.${index}.disponibleEnCompra`,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                            }
                                                            label="Disponible en compra"
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={watch(
                                                                        `unidadProductorSuplidor.${index}.disponibleEnVenta`,
                                                                    )}
                                                                    disabled={!watch(`unidadProductorSuplidor.${index}.activo`)}
                                                                    onChange={(e) =>
                                                                        setValue(
                                                                            `unidadProductorSuplidor.${index}.disponibleEnVenta`,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                            }
                                                            label="Disponible en venta"
                                                        />
                                                    </Box>

                                                    {/* Warehouse Limits for this Unit/Supplier */}
                                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3, mb: 1 }}>
                                                        Límites por Almacén
                                                    </Typography>
                                                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mt: 1 }}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                Configure límites de inventario específicos por almacén para esta
                                                                unidad/proveedor.
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => {
                                                                    const currentLimits =
                                                                        watch(
                                                                            `unidadProductorSuplidor.${index}.productosAlmacenesLimites`,
                                                                        ) || [];
                                                                    setValue(
                                                                        `unidadProductorSuplidor.${index}.productosAlmacenesLimites`,
                                                                        [
                                                                            ...currentLimits,
                                                                            {
                                                                                empresaId: 0,
                                                                                secuencia: 0,
                                                                                usuarioReg: "",
                                                                                fechaReg: new Date(),
                                                                                activo: true,
                                                                                limite: 0,
                                                                                almacenId: 0,
                                                                            },
                                                                        ],
                                                                    );
                                                                }}>
                                                                Agregar Límite de Almacén
                                                            </Button>
                                                        </Box>

                                                        {(
                                                            watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`) ||
                                                            []
                                                        ).map((limite: any, limiteIndex: number) => (
                                                            <Card
                                                                key={`limite-${index}-${limiteIndex}`}
                                                                variant="outlined"
                                                                sx={{ mb: 1, backgroundColor: "#f9f9f9" }}>
                                                                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "center",
                                                                            mb: 1,
                                                                        }}>
                                                                        <Typography variant="body2" fontWeight="medium">
                                                                            Límite #{limiteIndex + 1}
                                                                        </Typography>
                                                                        <Button
                                                                            color="error"
                                                                            size="small"
                                                                            onClick={() => {
                                                                                const currentLimits =
                                                                                    watch(
                                                                                        `unidadProductorSuplidor.${index}.productosAlmacenesLimites`,
                                                                                    ) || [];
                                                                                const newLimits = currentLimits.filter(
                                                                                    (_: any, i: number) => i !== limiteIndex,
                                                                                );
                                                                                setValue(
                                                                                    `unidadProductorSuplidor.${index}.productosAlmacenesLimites`,
                                                                                    newLimits,
                                                                                );
                                                                            }}>
                                                                            Eliminar
                                                                        </Button>
                                                                    </Box>
                                                                    <Grid container spacing={2}>
                                                                        <AlmacenComboBox
                                                                            name={`unidadProductorSuplidor.${index}.productosAlmacenesLimites.${limiteIndex}.almacenId`}
                                                                            label="Almacén"
                                                                            control={control}
                                                                            size={8}
                                                                        />
                                                                        <NumericInput
                                                                            label="Límite"
                                                                            name={`unidadProductorSuplidor.${index}.productosAlmacenesLimites.${limiteIndex}.limite`}
                                                                            control={control}
                                                                            size={4}
                                                                        />
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        ))}

                                                        {(!watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`) ||
                                                            watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`)
                                                                ?.length === 0) && (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ textAlign: "center", py: 2 }}>
                                                                No hay límites de almacén configurados
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    {/* Suppliers Section */}
                                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3, mb: 1 }}>
                                                        Proveedores
                                                    </Typography>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => {
                                                                const currentSuplidores =
                                                                    watch(
                                                                        `unidadProductorSuplidor.${index}.productosSuplidores`,
                                                                    ) || [];
                                                                setValue(`unidadProductorSuplidor.${index}.productosSuplidores`, [
                                                                    ...currentSuplidores,
                                                                    {
                                                                        empresaId: 0,
                                                                        secuencia: 0,
                                                                        usuarioReg: "",
                                                                        fechaReg: new Date(),
                                                                        activo: true,
                                                                        precio: 0,
                                                                        itbisDefault: false, // Default to false
                                                                        suplidorId: 0,
                                                                    },
                                                                ]);
                                                            }}>
                                                            Agregar Proveedor
                                                        </Button>
                                                    </Box>

                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                        {(
                                                            watch(`unidadProductorSuplidor.${index}.productosSuplidores`) || []
                                                        ).map((suplidor, suplidorIndex) => (
                                                            <Card key={suplidorIndex} variant="outlined" sx={{ p: 1 }}>
                                                                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "center",
                                                                            mb: 1,
                                                                        }}>
                                                                        <Typography variant="body2">
                                                                            Proveedor #{suplidorIndex + 1}
                                                                        </Typography>
                                                                        <Button
                                                                            color="error"
                                                                            size="small"
                                                                            onClick={() => {
                                                                                const currentSuplidores =
                                                                                    watch(
                                                                                        `unidadProductorSuplidor.${index}.productosSuplidores`,
                                                                                    ) || [];
                                                                                setValue(
                                                                                    `unidadProductorSuplidor.${index}.productosSuplidores`,
                                                                                    currentSuplidores.filter(
                                                                                        (_, i) => i !== suplidorIndex,
                                                                                    ),
                                                                                );
                                                                            }}>
                                                                            Eliminar
                                                                        </Button>
                                                                    </Box>
                                                                    <Grid container spacing={1}>
                                                                        <SuplidorComboBox
                                                                            name={`unidadProductorSuplidor.${index}.productosSuplidores.${suplidorIndex}.suplidorId`}
                                                                            label="Proveedor"
                                                                            control={control}
                                                                            size={4}
                                                                        />
                                                                        <MoneyInput
                                                                            label="Precio"
                                                                            name={`unidadProductorSuplidor.${index}.productosSuplidores.${suplidorIndex}.precio`}
                                                                            control={control}
                                                                            size={3}
                                                                        />
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        ))}

                                                        {(!watch(`unidadProductorSuplidor.${index}.productosSuplidores`) ||
                                                            watch(`unidadProductorSuplidor.${index}.productosSuplidores`)
                                                                ?.length === 0) && (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ textAlign: "center", py: 2 }}>
                                                                No hay proveedores configurados
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </AccordionDetails>
                    </Accordion>

                    {/* Product Modules */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Módulos del Producto ({productModulos.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Button variant="outlined" size="small" onClick={addProductoModulo}>
                                    Agregar Módulo
                                </Button>
                            </Box>

                            {productModulos.map((field, index) => (
                                <Card key={field.id} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <MenuComboBox
                                                name={`productosModulos.${index}.sgMenuId`}
                                                control={control}
                                                size={12}
                                            />
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </AccordionDetails>
                    </Accordion>

                    {/* Product Tags */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Etiquetas del Producto ({selectedTags.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Agrega etiquetas para categorizar tu producto. Puedes buscar etiquetas existentes o crear
                                    nuevas.
                                </Typography>

                                <Autocomplete
                                    multiple
                                    options={availableTags}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.nombre)}
                                    value={selectedTags}
                                    onChange={(event, newValue, reason, details) => {
                                        if (reason === "createOption" && typeof details?.option === "string") {
                                            // Crear nueva etiqueta
                                            const newTag = {
                                                id: Date.now(), // ID temporal
                                                nombre: details.option,
                                            };
                                            setAvailableTags((prev) => [...prev, newTag]);
                                            setSelectedTags((prev) => [...prev, newTag]);
                                        } else {
                                            setSelectedTags(newValue as Array<{ id: number; nombre: string }>);
                                        }
                                    }}
                                    freeSolo
                                    selectOnFocus
                                    clearOnBlur
                                    handleHomeEndKeys
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
                                            return (
                                                <Chip
                                                    key={`tag-${option.id}-${index}`}
                                                    label={option.nombre}
                                                    {...tagProps}
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Buscar o crear etiquetas"
                                            placeholder="Escribe para buscar o crear una nueva etiqueta..."
                                            variant="outlined"
                                            size="small"
                                            helperText="Presiona Enter para crear una etiqueta nueva"
                                        />
                                    )}
                                    renderOption={(props, option) => {
                                        const optionLabel = typeof option === "string" ? option : option.nombre;
                                        return (
                                            <li {...props}>
                                                <Chip label={optionLabel} size="small" variant="outlined" sx={{ mr: 1 }} />
                                                {optionLabel}
                                            </li>
                                        );
                                    }}
                                />
                            </Box>

                            {/* Display selected tags */}
                            {selectedTags.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Etiquetas Seleccionadas:
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {selectedTags.map((tag) => (
                                            <Chip
                                                key={tag.id}
                                                label={tag.nombre}
                                                variant="filled"
                                                color="primary"
                                                size="medium"
                                                onDelete={() => {
                                                    setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </section>
            </Box>

            {/* Modal Search Component */}
            {modalSearch.config && (
                <ModalSearch
                    open={modalSearch.isOpen}
                    onClose={modalSearch.closeModal}
                    onSelect={handleProductSelect}
                    config={modalSearch.config}
                    initialValues={modalSearch.initialValues}
                />
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default ProductoViewExample;
