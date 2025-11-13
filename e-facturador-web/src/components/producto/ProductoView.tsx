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
            itbisDefault: false,
            precio: 0,
            unidadId: 0,
            unidadFraccionId: 0,
            productoId: 0,
            productosSuplidores: [],
            productosAlmacenesLimites: [],
        });
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

                                        {/* Configuración de Unidades */}
                                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                            Configuración de Unidades
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <UnidadComboBox
                                                name={`unidadProductorSuplidor.${index}.unidadId`}
                                                label="Unidad Base"
                                                control={control}
                                                size={2}
                                            />

                                            <NumericInput
                                                label="Cantidad"
                                                name={`unidadProductorSuplidor.${index}.cantidad`}
                                                control={control}
                                                size={2}
                                            />
                                            <UnidadComboBox
                                                name={`unidadProductorSuplidor.${index}.unidadFraccionId`}
                                                label="Unidad Fracción"
                                                control={control}
                                                size={2}
                                            />
                                        </Grid>

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

                                        {/* Supplier and ITBIS Configuration */}
                                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                            Configuración de Proveedor e ITBIS
                                        </Typography>
                                        {/* Configuración adicional */}
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={watch(`unidadProductorSuplidor.${index}.itbisDefault`)}
                                                        onChange={(e) =>
                                                            setValue(
                                                                `unidadProductorSuplidor.${index}.itbisDefault`,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                }
                                                label="ITBIS por defecto"
                                            />
                                        </Box>

                                        {/* Opciones de Disponibilidad */}
                                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                            Disponibilidad
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={watch(`unidadProductorSuplidor.${index}.disponibleEnCompra`)}
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
                                                        checked={watch(`unidadProductorSuplidor.${index}.disponibleEnVenta`)}
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
                                                            watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`) ||
                                                            [];
                                                        setValue(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`, [
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

                                            {(watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`) || []).map(
                                                (limite: any, limiteIndex: number) => (
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
                                                )
                                            )}

                                            {(!watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`) ||
                                                watch(`unidadProductorSuplidor.${index}.productosAlmacenesLimites`)?.length ===
                                                    0) && (
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
                                                        watch(`unidadProductorSuplidor.${index}.productosSuplidores`) || [];
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
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={watch(
                                                                                `unidadProductorSuplidor.${index}.productosSuplidores.${suplidorIndex}.itbisDefault`
                                                                            )}
                                                                            onChange={(e) =>
                                                                                setValue(
                                                                                    `unidadProductorSuplidor.${index}.productosSuplidores.${suplidorIndex}.itbisDefault`,
                                                                                    e.target.checked
                                                                                )
                                                                            }
                                                                        />
                                                                    }
                                                                    label="ITBIS Por Defecto"
                                                                />
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            )}

                                            {(!watch(`unidadProductorSuplidor.${index}.productosSuplidores`) ||
                                                watch(`unidadProductorSuplidor.${index}.productosSuplidores`)?.length === 0) && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ textAlign: "center", py: 2 }}>
                                                    No hay proveedores configurados
                                                </Typography>
                                            )}
                                        </Box>
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
        </main>
    );
};

export default ProductoViewExample;
