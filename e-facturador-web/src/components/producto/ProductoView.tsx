import React, { useState } from "react";
import { useForm, SubmitHandler, FieldErrors, useFieldArray } from "react-hook-form";
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

    // Modal search hook
    const modalSearch = useModalSearch();

    const toggleCardExpansion = (index: number) => {
        setExpandedCards((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Function to clear the form and search
    const clearForm = () => {
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
        saveProducto(transformedData)
            .then((response) => {
                alert("Producto guardado correctamente");
                reset();
            })
            .catch((error) => {
                console.error("Error al guardar el producto:", error);
                alert("Error al guardar el producto");
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
                    <Button size="small" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button size="small" type="button" onClick={clearForm}>
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
                                <Box sx={{ width: `${(3 / 12) * 100}%`, mb: 2, display: "flex", alignItems: "center" }}>
                                    <SearchButton
                                        config={SEARCH_CONFIGS.PRODUCTO}
                                        onOpenSearch={modalSearch.openModal}
                                        variant="button"
                                        size="small"
                                        initialValues={{ estado: "activo" }}>
                                        Buscar Producto
                                    </SearchButton>
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

                            {unidadProductorSuplidor.map((field, index) => (
                                <Card key={field.id} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="flex-end">
                                            <UnidadComboBox
                                                name={`unidadProductorSuplidor.${index}.unidadId`}
                                                label="Unidad Base"
                                                control={control}
                                                size={3}
                                            />

                                            <Box sx={{ mb: 0, "& > div": { mb: 0 } }}>
                                                <NumericInput
                                                    label="Cantidad"
                                                    name={`unidadProductorSuplidor.${index}.cantidad`}
                                                    control={control}
                                                    size={12}
                                                />
                                            </Box>

                                            <UnidadComboBox
                                                name={`unidadProductorSuplidor.${index}.unidadFraccionId`}
                                                label="Unidad Fracción"
                                                control={control}
                                                size={3}
                                            />

                                            {/* Action buttons in the same row, aligned to the right */}
                                            <Grid
                                                size={{ xs: 12, sm: "auto" }}
                                                sx={{ marginLeft: "auto", display: "flex", gap: 1, alignItems: "center" }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleCardExpansion(index)}
                                                    sx={{
                                                        transform: expandedCards[index] ? "rotate(180deg)" : "rotate(0deg)",
                                                        transition: "transform 0.3s",
                                                    }}>
                                                    <ExpandMoreIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => removeUnidad(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
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
                                                    />
                                                    <MoneyInput
                                                        label="Precio Mínimo"
                                                        name={`unidadProductorSuplidor.${index}.precioMinimo`}
                                                        control={control}
                                                        size={2}
                                                    />
                                                    <MoneyInput
                                                        label="Precio de Costo"
                                                        name={`unidadProductorSuplidor.${index}.precio`}
                                                        control={control}
                                                        size={2}
                                                    />
                                                    <MoneyInput
                                                        label="Precio Costo Promedio"
                                                        name={`unidadProductorSuplidor.${index}.precioCostoAvg`}
                                                        control={control}
                                                        size={2}
                                                    />
                                                    <NumericInput
                                                        label="Existencia"
                                                        name={`unidadProductorSuplidor.${index}.existencia`}
                                                        control={control}
                                                        size={2}
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
                                                                    `unidadProductorSuplidor.${index}.disponibleEnCompra`
                                                                )}
                                                                onChange={(e) =>
                                                                    setValue(
                                                                        `unidadProductorSuplidor.${index}.disponibleEnCompra`,
                                                                        e.target.checked
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
                                                                    `unidadProductorSuplidor.${index}.disponibleEnVenta`
                                                                )}
                                                                onChange={(e) =>
                                                                    setValue(
                                                                        `unidadProductorSuplidor.${index}.disponibleEnVenta`,
                                                                        e.target.checked
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
                                                                        `unidadProductorSuplidor.${index}.productosAlmacenesLimites`
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
                                                                    ]
                                                                );
                                                            }}>
                                                            Agregar Límite de Almacén
                                                        </Button>
                                                    </Box>

                                                    {(
                                                        watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`) || []
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
                                                                                    `unidadProductorSuplidor.${index}.productosAlmacenesLimites`
                                                                                ) || [];
                                                                            const newLimits = currentLimits.filter(
                                                                                (_: any, i: number) => i !== limiteIndex
                                                                            );
                                                                            setValue(
                                                                                `unidadProductorSuplidor.${index}.productosAlmacenesLimites`,
                                                                                newLimits
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
                                                                watch(`unidadProductorSuplidor.${index}.productosSuplidores`) ||
                                                                [];
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
                                                    {(watch(`unidadProductorSuplidor.${index}.productosSuplidores`) || []).map(
                                                        (suplidor, suplidorIndex) => (
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
                                                                                        `unidadProductorSuplidor.${index}.productosSuplidores`
                                                                                    ) || [];
                                                                                setValue(
                                                                                    `unidadProductorSuplidor.${index}.productosSuplidores`,
                                                                                    currentSuplidores.filter(
                                                                                        (_, i) => i !== suplidorIndex
                                                                                    )
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
                                                        )
                                                    )}

                                                    {(!watch(`unidadProductorSuplidor.${index}.productosSuplidores`) ||
                                                        watch(`unidadProductorSuplidor.${index}.productosSuplidores`)?.length ===
                                                            0) && (
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
                            ))}
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
                            <Typography variant="h6">Etiquetas del Producto ({productTags.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Las etiquetas ayudan a categorizar y organizar los productos para facilitar su búsqueda.
                                </Typography>
                                <Button variant="outlined" size="small" onClick={addProductoTag}>
                                    Agregar Etiqueta
                                </Button>
                            </Box>

                            {productTags.map((field, index) => (
                                <Card key={field.id} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                            }}>
                                            <Typography variant="subtitle1">Etiqueta #{index + 1}</Typography>
                                            <Button color="error" size="small" onClick={() => removeProductoTag(index)}>
                                                Eliminar
                                            </Button>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <TagComboBox
                                                name={`tags.${index}.tagId`}
                                                label="Etiqueta"
                                                control={control}
                                                size={12}
                                            />
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
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
        </main>
    );
};

export default ProductoViewExample;
