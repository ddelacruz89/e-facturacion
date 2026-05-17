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
    Select,
    MenuItem,
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
import { validateProducto } from "../../validations/productoValidation";

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
            existencia: 0,
            precioVenta: 0,
            precioMinimo: 0,
            precioCostoAvg: 0,
            precio: 0,
            trabajador: false,
            comision: 0,
            itbisId: 0,
            categoriaId: 0,
            unidadProductorSuplidor: [],
            productosModulos: [],
            inventarios: [],
            tags: [],
            productosAlmacenesLimites: [],
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

    // -----------------------------------------------------------------------
    // Estado: tipo de categoría
    // -----------------------------------------------------------------------
    /**
     * esServicio = true cuando la categoría seleccionada tiene inventario = false.
     * Controla qué campos/secciones se muestran y cómo se valida.
     */
    const [esServicio, setEsServicio] = useState(false);

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
        message: React.ReactNode;
        severity: "success" | "error" | "warning" | "info";
    }>({
        open: false,
        message: "",
        severity: "info",
    });

    // Modal search hook
    const modalSearch = useModalSearch();

    const [tipoBusqueda, setTipoBusqueda] = useState<"producto" | "servicio">("producto");

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showSnackbar = (message: React.ReactNode, severity: "success" | "error" | "warning" | "info") => {
        setSnackbar({ open: true, message, severity });
    };

    // -----------------------------------------------------------------------
    // Handler: cambio de categoría
    // -----------------------------------------------------------------------
    /**
     * Recibe la ComboBoxOption completa (incluye el campo `inventario`
     * que agregamos en CategoriaComboBox).
     * - Si inventario === false → es Servicio
     * - Si inventario === true o undefined → es Producto
     */
    const handleCategoriaChange = (option: any) => {
        // inventario=true → Producto | inventario=false|null → Servicio
        // Sólo marcamos servicio cuando hay una opción seleccionada y no tiene inventario
        const esServicioNuevo = option != null && option?.inventario !== true;
        setEsServicio(esServicioNuevo);

        if (esServicioNuevo) {
            // Servicios: limpiar existencia y límites de almacén
            setValue("existencia", undefined as any);
            setValue("productosAlmacenesLimites", []);

            // Ajustar unidades existentes: cantidad=1, disponibleEnCompra=false
            const unidades = watch("unidadProductorSuplidor") || [];
            unidades.forEach((_: any, idx: number) => {
                setValue(`unidadProductorSuplidor.${idx}.cantidad`, 1);
                setValue(`unidadProductorSuplidor.${idx}.disponibleEnCompra`, false);
            });
        }
    };

    // Validar que la combinación unidadId + cantidad + unidadFraccionId sea única
    const validateUnidadCombination = (currentIndex: number, unidadId: any, cantidad: any, unidadFraccionId: any): boolean => {
        const unidadIdValue = (unidadId && (unidadId.id || unidadId.value)) || unidadId;
        const unidadFraccionIdValue = (unidadFraccionId && (unidadFraccionId.id || unidadFraccionId.value)) || unidadFraccionId;
        const cantidadValue = Number(cantidad) || 0;

        if (
            !unidadIdValue ||
            !unidadFraccionIdValue ||
            unidadIdValue === 0 ||
            unidadFraccionIdValue === 0 ||
            cantidadValue === 0
        ) {
            return true;
        }

        const allUnidades = watch("unidadProductorSuplidor");
        const duplicateIndexes = new Set<number>();

        allUnidades.forEach((unidad, idx) => {
            const existingUnidadId =
                (unidad.unidadId && ((unidad.unidadId as any).id || (unidad.unidadId as any).value)) || unidad.unidadId;
            const existingUnidadFraccionId =
                (unidad.unidadFraccionId && ((unidad.unidadFraccionId as any).id || (unidad.unidadFraccionId as any).value)) ||
                unidad.unidadFraccionId;
            const existingCantidad = Number(unidad.cantidad) || 0;

            if (existingUnidadId && existingUnidadFraccionId && existingCantidad > 0) {
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

        setDuplicateRows(duplicateIndexes);

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
        setEsServicio(false);
        reset({
            empresaId: 0,
            secuencia: 0,
            usuarioReg: "",
            fechaReg: new Date(),
            activo: true,
            nombreProducto: "",
            descripcion: "",
            codigoBarra: "",
            existencia: 0,
            precioVenta: 0,
            precioMinimo: 0,
            precioCostoAvg: 0,
            precio: 0,
            trabajador: false,
            comision: 0,
            itbisId: 0,
            categoriaId: 0,
            unidadProductorSuplidor: [],
            productosModulos: [],
            inventarios: [],
            tags: [],
            productosAlmacenesLimites: [],
        });
    };

    // Handle product selection from modal search
    const handleProductSelect = modalSearch.handleSelect(async (product) => {
        try {
            setSelectedProduct(product as MgProducto);

            const productoCompleto = await getProducto(product.id);

            console.log("Producto completo obtenido:", productoCompleto);

            reset({
                ...productoCompleto,
                unidadProductorSuplidor: productoCompleto.unidadProductorSuplidor || [],
                productosModulos: productoCompleto.productosModulos || [],
                inventarios: productoCompleto.inventarios || [],
                tags: productoCompleto.tags || [],
                productosAlmacenesLimites: productoCompleto.productosAlmacenesLimites || [],
            });

            setSelectedProduct(productoCompleto);

            showSnackbar("Producto cargado correctamente", "success");
        } catch (error) {
            console.error("Error al cargar el producto completo:", error);
            showSnackbar("Error al cargar el producto completo", "error");
        }
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

    const onSubmit: SubmitHandler<MgProducto> = async (data) => {
        console.log("Raw form data:", data);

        // Validar con Yup — se pasa esServicio como contexto
        const validation = await validateProducto(data, esServicio);

        if (!validation.isValid) {
            console.log("❌ Errores de validación:", validation.errors);

            const errorMessages = Object.values(validation.errors);
            const errorCount = errorMessages.length;

            const errorContent = (
                <Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                        Se encontrar{errorCount > 1 ? "on" : "ó"} {errorCount} error{errorCount > 1 ? "es" : ""}:
                    </Typography>
                    {errorMessages.map((error, index) => (
                        <Typography key={index} variant="body2" sx={{ pl: 1 }}>
                            • {error}
                        </Typography>
                    ))}
                </Box>
            );

            showSnackbar(errorContent, "error");
            return;
        }

        console.log("✅ Validación exitosa");

        const transformedData: MgProducto = {
            ...data,
            categoriaId:
                typeof data.categoriaId === "object" && data.categoriaId !== null ? (data.categoriaId as any) : data.categoriaId,
            itbisId: typeof data.itbisId === "object" && data.itbisId !== null ? (data.itbisId as any) : data.itbisId,
            unidadProductorSuplidor: data.unidadProductorSuplidor?.map((item) => ({
                ...item,
                unidadId: typeof item.unidadId === "object" && item.unidadId !== null ? (item.unidadId as any) : item.unidadId,
                unidadFraccionId:
                    typeof item.unidadFraccionId === "object" && item.unidadFraccionId !== null
                        ? (item.unidadFraccionId as any)
                        : item.unidadFraccionId,
                productosSuplidores: item.productosSuplidores?.map((suplidor) => ({
                    ...suplidor,
                    suplidorId:
                        typeof suplidor.suplidorId === "object" && suplidor.suplidorId !== null
                            ? (suplidor.suplidorId as any)
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
                setSelectedProduct(response);

                if (response.id) setValue("id", response.id);
                if (response.secuencia) setValue("secuencia", response.secuencia);
                if (response.fechaReg) setValue("fechaReg", response.fechaReg);
            })
            .catch((error) => {
                console.error("Error al guardar el producto:", error);
                showSnackbar(error?.message || "Error al guardar el producto", "error");
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
            // Servicios: cantidad fija en 1, solo disponible en venta
            cantidad: 1,
            disponibleEnCompra: esServicio ? false : true,
            disponibleEnVenta: true,
            unidadId: 0,
            unidadFraccionId: 0,
            productoId: 0,
            productosSuplidores: [],
        });

        const newIndex = unidadProductorSuplidor.length;
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
                <ActionBar title={esServicio ? "Servicio" : "Producto"}>
                    <Button
                        size="small"
                        sx={{
                            color: "white",
                            backgroundColor: "#1976d2",
                            "&:hover": { backgroundColor: "#1565c0" },
                        }}
                        type="submit">
                        Guardar
                    </Button>
                    <Button
                        size="small"
                        sx={{
                            color: "white",
                            backgroundColor: "#1976d2",
                            "&:hover": { backgroundColor: "#1565c0" },
                        }}
                        type="button"
                        onClick={clearForm}>
                        Nuevo
                    </Button>
                </ActionBar>

                <section>
                    {/* ---------------------------------------------------------------- */}
                    {/* Información Básica                                               */}
                    {/* ---------------------------------------------------------------- */}
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Información Básica
                            </Typography>
                            <Grid container spacing={2}>
                                {/* Buscar + Código de Barra alineados al mismo nivel */}
                                <Box sx={{ width: "50%", display: "flex", alignItems: "flex-end", gap: 2, mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: "flex" }}>
                                            <Select
                                                value={tipoBusqueda}
                                                onChange={(e) => setTipoBusqueda(e.target.value as "producto" | "servicio")}
                                                size="small"
                                                sx={{
                                                    minWidth: 110,
                                                    fontSize: "0.8rem",
                                                    "& .MuiOutlinedInput-notchedOutline": { borderRight: "none" },
                                                    borderRadius: "4px 0 0 4px",
                                                    "& .MuiSelect-select": { py: "8.5px" },
                                                }}>
                                                <MenuItem value="producto">Productos</MenuItem>
                                                <MenuItem value="servicio">Servicios</MenuItem>
                                            </Select>
                                            <Box
                                                sx={{
                                                    minWidth: 260,

                                                    flex: 1,
                                                    "& .MuiOutlinedInput-root": { borderRadius: "0 4px 4px 0" },
                                                }}>
                                                <SearchButton
                                                    config={
                                                        tipoBusqueda === "producto"
                                                            ? SEARCH_CONFIGS.PRODUCTO_VENTA
                                                            : SEARCH_CONFIGS.PRODUCTO_SERVICIO
                                                    }
                                                    onOpenSearch={modalSearch.openModal}
                                                    variant="input"
                                                    size="small"
                                                    label={tipoBusqueda === "producto" ? "Buscar Producto" : "Buscar Servicio"}
                                                    displayValue={selectedProduct?.id || ""}
                                                    placeholder={
                                                        tipoBusqueda === "producto"
                                                            ? "Seleccione un producto..."
                                                            : "Seleccione un servicio..."
                                                    }
                                                    initialValues={{ estado: "activo" }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ minWidth: 260, flex: 1 }}>
                                        <Controller
                                            name="codigoBarra"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Código de Barra"
                                                    size="small"
                                                    fullWidth
                                                    error={!!errors.codigoBarra}
                                                    helperText={errors.codigoBarra?.message}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Box>

                                <AlphanumericInput
                                    label={esServicio ? "Nombre del Servicio" : "Nombre del Producto"}
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

                            <Grid container spacing={2}>
                                <CategoriaComboBox
                                    name="categoriaId"
                                    control={control}
                                    error={errors.categoriaId as any}
                                    rules={{ required: "Seleccione una categoría" }}
                                    size={6}
                                    onSelectionChange={handleCategoriaChange}
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

                            {/* -------------------------------------------------------- */}
                            {/* Precios e Inventario                                     */}
                            {/* -------------------------------------------------------- */}
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                Precios e Inventario
                            </Typography>
                            <Grid container spacing={2}>
                                <MoneyInput
                                    label="Precio de Venta"
                                    name="precioVenta"
                                    control={control}
                                    error={errors.precioVenta}
                                    size={2}
                                />
                                <MoneyInput
                                    label="Precio Mínimo"
                                    name="precioMinimo"
                                    control={control}
                                    error={errors.precioMinimo}
                                    size={2}
                                />
                                {/* Precio de costo, costo promedio y existencia: deshabilitados para servicios */}
                                <MoneyInput
                                    label="Precio de Costo"
                                    name="precio"
                                    control={control}
                                    error={errors.precio}
                                    size={2}
                                    disabled={esServicio}
                                />
                                <MoneyInput
                                    label="Precio Costo Promedio"
                                    name="precioCostoAvg"
                                    control={control}
                                    error={errors.precioCostoAvg}
                                    size={2}
                                    disabled={esServicio}
                                />
                                <NumericInput
                                    label="Existencia"
                                    name="existencia"
                                    control={control}
                                    error={errors.existencia}
                                    size={2}
                                    disabled={esServicio}
                                />
                            </Grid>

                            {/* -------------------------------------------------------- */}
                            {/* Configuración General                                    */}
                            {/* -------------------------------------------------------- */}
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

                            {/* Chip indicador cuando es servicio */}
                            {esServicio && (
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        label="Servicio — solo disponible en venta · sin existencia · sin límites por almacén"
                                        color="info"
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* ---------------------------------------------------------------- */}
                    {/* Límites por Almacén (deshabilitado para servicios)              */}
                    {/* ---------------------------------------------------------------- */}
                    <Accordion disabled={esServicio}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" color={esServicio ? "text.disabled" : "text.primary"}>
                                Límites por Almacén ({(watch("productosAlmacenesLimites") || []).length})
                                {esServicio && (
                                    <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                                        — no aplica para servicios
                                    </Typography>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Configure límites de inventario específicos por almacén para este producto.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={esServicio}
                                    onClick={() => {
                                        const currentLimits = watch("productosAlmacenesLimites") || [];
                                        setValue("productosAlmacenesLimites", [
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
                                        ]);
                                    }}>
                                    Agregar Límite de Almacén
                                </Button>
                            </Box>

                            {(watch("productosAlmacenesLimites") || []).map((limite: any, limiteIndex: number) => (
                                <Card key={`limite-${limiteIndex}`} variant="outlined" sx={{ mb: 2, backgroundColor: "#f9f9f9" }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                            }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                Límite #{limiteIndex + 1}
                                            </Typography>
                                            <Button
                                                color="error"
                                                size="small"
                                                disabled={esServicio}
                                                onClick={() => {
                                                    const currentLimits = watch("productosAlmacenesLimites") || [];
                                                    const newLimits = currentLimits.filter(
                                                        (_: any, i: number) => i !== limiteIndex,
                                                    );
                                                    setValue("productosAlmacenesLimites", newLimits);
                                                }}>
                                                Eliminar
                                            </Button>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <AlmacenComboBox
                                                name={`productosAlmacenesLimites.${limiteIndex}.almacenId`}
                                                label="Almacén"
                                                control={control}
                                                size={8}
                                                disabled={esServicio}
                                            />
                                            <NumericInput
                                                label="Límite"
                                                name={`productosAlmacenesLimites.${limiteIndex}.limite`}
                                                control={control}
                                                size={4}
                                                disabled={esServicio}
                                            />
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}

                            {(!watch("productosAlmacenesLimites") || watch("productosAlmacenesLimites")?.length === 0) && (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                    No hay límites de almacén configurados
                                </Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    {/* ---------------------------------------------------------------- */}
                    {/* Unidades y Proveedores                                           */}
                    {/* ---------------------------------------------------------------- */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                {esServicio ? "Unidades de Venta" : "Unidades y Proveedores"} ({unidadProductorSuplidor.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {esServicio
                                        ? "Defina las unidades de medida para la venta del servicio."
                                        : "Defina las diferentes unidades de medida y sus proveedores."}
                                </Typography>
                                <Button variant="outlined" size="small" onClick={addUnidadFraccion}>
                                    Agregar Unidad{esServicio ? "" : "/Fracción"}
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
                                                    {/* Cantidad: fija en 1 para servicios */}
                                                    <NumericInput
                                                        label="Cantidad"
                                                        name={`unidadProductorSuplidor.${index}.cantidad`}
                                                        control={control}
                                                        size={12}
                                                        disabled={!watch(`unidadProductorSuplidor.${index}.activo`) || esServicio}
                                                        onBlur={(value: any) => {
                                                            if (!esServicio) {
                                                                const unidadId = watch(
                                                                    `unidadProductorSuplidor.${index}.unidadId`,
                                                                );
                                                                const unidadFraccionId = watch(
                                                                    `unidadProductorSuplidor.${index}.unidadFraccionId`,
                                                                );
                                                                validateUnidadCombination(
                                                                    index,
                                                                    unidadId,
                                                                    value,
                                                                    unidadFraccionId,
                                                                );
                                                            }
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
                                                            if (!esServicio) {
                                                                validateUnidadCombination(index, unidadId, cantidad, value);
                                                            }
                                                        }, 50);
                                                    }}
                                                />
                                                {/* Action buttons */}
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
                                                    {/* -------------------------------------------------- */}
                                                    {/* Disponibilidad                                       */}
                                                    {/* -------------------------------------------------- */}
                                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                                        Disponibilidad
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                        {/* Disponible en compra: deshabilitado para servicios */}
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={watch(
                                                                        `unidadProductorSuplidor.${index}.disponibleEnCompra`,
                                                                    )}
                                                                    disabled={
                                                                        esServicio ||
                                                                        !watch(`unidadProductorSuplidor.${index}.activo`)
                                                                    }
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
                                                        {/* Disponible en venta: siempre activo para servicios */}
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={watch(
                                                                        `unidadProductorSuplidor.${index}.disponibleEnVenta`,
                                                                    )}
                                                                    disabled={
                                                                        esServicio ||
                                                                        !watch(`unidadProductorSuplidor.${index}.activo`)
                                                                    }
                                                                    onChange={(e) =>
                                                                        setValue(
                                                                            `unidadProductorSuplidor.${index}.disponibleEnVenta`,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                            }
                                                            label={
                                                                esServicio
                                                                    ? "Disponible en venta (siempre)"
                                                                    : "Disponible en venta"
                                                            }
                                                        />
                                                    </Box>

                                                    {/* -------------------------------------------------- */}
                                                    {/* Proveedores — disponible también para servicios     */}
                                                    {/* -------------------------------------------------- */}
                                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3, mb: 1 }}>
                                                        {esServicio ? "Costo del Servicio (Proveedores)" : "Proveedores"}
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
                                                                        itbisDefault: false,
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
                                                                            label={esServicio ? "Costo" : "Precio"}
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

                    {/* ---------------------------------------------------------------- */}
                    {/* Módulos del Producto                                             */}
                    {/* ---------------------------------------------------------------- */}
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

                    {/* ---------------------------------------------------------------- */}
                    {/* Etiquetas                                                        */}
                    {/* ---------------------------------------------------------------- */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Etiquetas ({selectedTags.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Agrega etiquetas para categorizar. Puedes buscar etiquetas existentes o crear nuevas.
                                </Typography>

                                <Autocomplete
                                    multiple
                                    options={availableTags}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.nombre)}
                                    value={selectedTags}
                                    onChange={(event, newValue, reason, details) => {
                                        if (reason === "createOption" && typeof details?.option === "string") {
                                            const newTag = {
                                                id: Date.now(),
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
