import React from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AlphanumericInput, NumericInput, MoneyInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { saveProducto } from "../../apis/ProductoController";
import { MgProducto, MgUnidad } from "../../models/producto";
import { InAlmacen } from "../../models/inventario";
import { SgMenu } from "../../models/seguridad";

// Import the new ComboBox components
import {
    CategoriaComboBox,
    UnidadComboBox,
    ItbisComboBox,
    AlmacenComboBox,
    MenuComboBox,
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
            nombreProducto: "",
            descripcion: "",
            codigoBarra: "",
            existencia: 0,
            precioVenta: 0,
            precioMinimo: 0,
            soloEnCompra: false,
            precioCostoAvg: 0,
            trabajador: false,
            comision: 0,
            unidadFraccions: [],
            productosAlmacenesLimites: [],
            productosModulos: [],
        },
    });

    const {
        fields: unidadFraccions,
        append: appendUnidad,
        remove: removeUnidad,
    } = useFieldArray({
        control,
        name: "unidadFraccions",
    });

    const {
        fields: almacenLimites,
        append: appendAlmacenLimite,
        remove: removeAlmacenLimite,
    } = useFieldArray({
        control,
        name: "productosAlmacenesLimites",
    });

    const {
        fields: productModulos,
        append: appendProductoModulo,
        remove: removeProductoModulo,
    } = useFieldArray({
        control,
        name: "productosModulos",
    });

    const onSubmit: SubmitHandler<MgProducto> = (data) => {
        console.log("Saving producto:", data);
        saveProducto(data)
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
            cantidad: 1,
            precioVenta: 0,
            precioMinimo: 0,
            disponibleEnCompra: true,
            disponibleEnVenta: true,
            existencia: 0,
            unidadId: {} as MgUnidad,
            unidadFraccionId: {} as MgUnidad,
        });
    };

    const addAlmacenLimite = () => {
        appendAlmacenLimite({
            limite: 0,
            almacenId: {} as InAlmacen,
        });
    };

    const addProductoModulo = () => {
        appendProductoModulo({
            sgMenuId: {} as SgMenu,
        });
    };

    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Producto">
                    <Button size="small" color="primary" type="submit">
                        Guardar
                    </Button>
                    <Button size="small" type="button" onClick={() => reset()}>
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
                                <AlphanumericInput
                                    label="Código de Barra"
                                    size={4}
                                    name="codigoBarra"
                                    control={control}
                                    error={errors.codigoBarra}
                                />
                                <AlphanumericInput
                                    label="Nombre del Producto"
                                    size={8}
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
                        </CardContent>
                    </Card>

                    {/* Pricing and Inventory */}
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Precios e Inventario
                            </Typography>
                            <Grid container spacing={2}>
                                <NumericInput
                                    label="Existencia"
                                    size={3}
                                    name="existencia"
                                    control={control}
                                    error={errors.existencia}
                                />
                                <MoneyInput
                                    label="Precio de Venta"
                                    size={3}
                                    name="precioVenta"
                                    control={control}
                                    error={errors.precioVenta}
                                />
                                <MoneyInput
                                    label="Precio Mínimo"
                                    size={3}
                                    name="precioMinimo"
                                    control={control}
                                    error={errors.precioMinimo}
                                />
                                <MoneyInput
                                    label="Precio Costo Promedio"
                                    size={3}
                                    name="precioCostoAvg"
                                    control={control}
                                    error={errors.precioCostoAvg}
                                />
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Unit Fractions */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Unidades y Fracciones ({unidadFraccions.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Button variant="outlined" size="small" onClick={addUnidadFraccion}>
                                    Agregar Unidad/Fracción
                                </Button>
                            </Box>

                            {unidadFraccions.map((field, index) => (
                                <Card key={field.id} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                            }}>
                                            <Typography variant="subtitle1">Unidad/Fracción #{index + 1}</Typography>
                                            <Button color="error" size="small" onClick={() => removeUnidad(index)}>
                                                Eliminar
                                            </Button>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <UnidadComboBox
                                                name={`unidadFraccions.${index}.unidadId`}
                                                label="Unidad Base"
                                                control={control}
                                                size={4}
                                            />
                                            <UnidadComboBox
                                                name={`unidadFraccions.${index}.unidadFraccionId`}
                                                label="Unidad Fracción"
                                                control={control}
                                                size={4}
                                            />
                                            <NumericInput
                                                label="Cantidad"
                                                name={`unidadFraccions.${index}.cantidad`}
                                                control={control}
                                                size={4}
                                            />
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </AccordionDetails>
                    </Accordion>

                    {/* Warehouse Limits */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Límites por Almacén ({almacenLimites.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Button variant="outlined" size="small" onClick={addAlmacenLimite}>
                                    Agregar Límite de Almacén
                                </Button>
                            </Box>

                            {almacenLimites.map((field, index) => (
                                <Card key={field.id} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <AlmacenComboBox
                                                name={`productosAlmacenesLimites.${index}.almacenId`}
                                                control={control}
                                                size={8}
                                            />
                                            <NumericInput
                                                label="Límite"
                                                name={`productosAlmacenesLimites.${index}.limite`}
                                                control={control}
                                                size={4}
                                            />
                                        </Grid>
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
                </section>
            </Box>
        </main>
    );
};

export default ProductoViewExample;
