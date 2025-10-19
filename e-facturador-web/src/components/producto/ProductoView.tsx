import React, { useEffect, useState } from "react";
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
import { AlphanumericInput, NumericInput, MoneyInput, SelectInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { getProductos, saveProducto } from "../../apis/ProductoController";
import { getCategorias } from "../../apis/CategoriaController";
import { getUnidades } from "../../apis/UnidadController";
import { getItbisActivos, getItbisOptions } from "../../apis/ItbisController";
import { getAlmacenesActivos } from "../../apis/AlmacenController";
import { getMenusActivos } from "../../apis/MenuController";
import { MgProducto, MgCategoria, MgUnidad } from "../../models/producto";
import { InAlmacen } from "../../models/inventario";
import { SgMenu } from "../../models/seguridad";
import { MgItbis } from "../../models/facturacion";

const ProductoView = () => {
    const [categorias, setCategorias] = useState<MgCategoria[]>([]);
    const [unidades, setUnidades] = useState<MgUnidad[]>([]);
    const [itbisOptions, setItbisOptions] = useState<MgItbis[]>([]);
    const [almacenes, setAlmacenes] = useState<InAlmacen[]>([]);
    const [menus, setMenus] = useState<SgMenu[]>([]);

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

    // Load initial data
    useEffect(() => {
        Promise.all([getCategorias(), getUnidades(), getItbisActivos(), getAlmacenesActivos(), getMenusActivos()])
            .then(([categoriasData, unidadesData, itbisData, almacenesData, menusData]) => {
                console.log("Loaded categorias:", categoriasData);
                console.log("Categorias count:", categoriasData.length);

                debugger;
                setCategorias(categoriasData);
                setUnidades(unidadesData);
                setItbisOptions(itbisData);
                setAlmacenes(almacenesData);
                setMenus(menusData);
            })
            .catch((error) => {
                console.error("Error loading initial data:", error);
            });
    }, []);

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

                            <Grid container spacing={2}>
                                <SelectInput
                                    label="Categoría"
                                    name="categoriaId"
                                    control={control}
                                    error={errors.categoriaId as any}
                                    options={(() => {
                                        console.log("Rendering categoria options, categorias:", categorias);
                                        const options = categorias.map((cat) => ({
                                            value: cat.id,
                                            label: cat.categoria,
                                        }));
                                        console.log("Categoria options:", options);
                                        return options;
                                    })()}
                                    rules={{ required: "Seleccione una categoría" }}
                                    size={6}
                                />
                                <SelectInput
                                    label="ITBIS"
                                    name="itbisId"
                                    control={control}
                                    error={errors.itbisId as any}
                                    options={itbisOptions.map((itbis) => ({
                                        value: itbis.id?.toString() || "",
                                        label: `${itbis.nombre} (${itbis.itbis}%)`,
                                    }))}
                                    rules={{ required: "Seleccione un ITBIS" }}
                                    size={6}
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

                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={watch("soloEnCompra")}
                                            onChange={(e) => setValue("soloEnCompra", e.target.checked)}
                                        />
                                    }
                                    label="Solo disponible en compra"
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
                                            <SelectInput
                                                label="Unidad Base"
                                                name={`unidadFraccions.${index}.unidadId`}
                                                control={control}
                                                options={unidades.map((unidad) => ({
                                                    value: unidad.id,
                                                    label: `${unidad.nombre} (${unidad.abreviacion})`,
                                                }))}
                                                size={4}
                                            />
                                            <SelectInput
                                                label="Unidad Fracción"
                                                name={`unidadFraccions.${index}.unidadFraccionId`}
                                                control={control}
                                                options={unidades.map((unidad) => ({
                                                    value: unidad.id,
                                                    label: `${unidad.nombre} (${unidad.abreviacion})`,
                                                }))}
                                                size={4}
                                            />
                                            <NumericInput
                                                label="Cantidad"
                                                name={`unidadFraccions.${index}.cantidad`}
                                                control={control}
                                                size={4}
                                            />
                                        </Grid>

                                        <Grid container spacing={2}>
                                            <MoneyInput
                                                label="Precio Venta"
                                                name={`unidadFraccions.${index}.precioVenta`}
                                                control={control}
                                                size={3}
                                            />
                                            <MoneyInput
                                                label="Precio Mínimo"
                                                name={`unidadFraccions.${index}.precioMinimo`}
                                                control={control}
                                                size={3}
                                            />
                                            <NumericInput
                                                label="Existencia"
                                                name={`unidadFraccions.${index}.existencia`}
                                                control={control}
                                                size={3}
                                            />
                                            <MoneyInput
                                                label="Costo Promedio"
                                                name={`unidadFraccions.${index}.precioCostoAvg`}
                                                control={control}
                                                size={3}
                                            />
                                        </Grid>

                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={watch(`unidadFraccions.${index}.disponibleEnCompra`)}
                                                        onChange={(e) =>
                                                            setValue(
                                                                `unidadFraccions.${index}.disponibleEnCompra`,
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
                                                        checked={watch(`unidadFraccions.${index}.disponibleEnVenta`)}
                                                        onChange={(e) =>
                                                            setValue(
                                                                `unidadFraccions.${index}.disponibleEnVenta`,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Disponible en venta"
                                            />
                                        </Box>
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
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                            }}>
                                            <Typography variant="subtitle1">Límite #{index + 1}</Typography>
                                            <Button color="error" size="small" onClick={() => removeAlmacenLimite(index)}>
                                                Eliminar
                                            </Button>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <SelectInput
                                                label="Almacén"
                                                name={`productosAlmacenesLimites.${index}.almacenId`}
                                                control={control}
                                                options={almacenes.map((almacen) => ({
                                                    value: almacen.id?.toString() || "",
                                                    label: almacen.nombre,
                                                }))}
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
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                            }}>
                                            <Typography variant="subtitle1">Módulo #{index + 1}</Typography>
                                            <Button color="error" size="small" onClick={() => removeProductoModulo(index)}>
                                                Eliminar
                                            </Button>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <SelectInput
                                                label="Menú/Módulo"
                                                name={`productosModulos.${index}.sgMenuId`}
                                                control={control}
                                                options={menus.map((menu) => ({
                                                    value: menu.id?.toString() || "",
                                                    label: menu.nombre,
                                                }))}
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

export default ProductoView;
