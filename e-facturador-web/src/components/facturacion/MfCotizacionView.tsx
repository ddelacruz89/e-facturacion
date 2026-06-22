import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Cotizacion, CotizacionDetalle, ICotizacionResumen } from "../../models/MfContizacion";
import { MgRetencion } from "../../models/facturacion";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TextInput, GridRow, TableComponentFacturacion, TextInputSearch, TextInputPkSearch } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { RetencionesSelect, TipoComprobanteSelect } from "../../customers/ComboBox";
import { saveCotizacion, getByNumeroCotizacion } from "../../apis/MfCotizacionController";
import ListaProductoVenta from "./ListaProductoVenta";
import { ProductoVenta } from "../../models/producto/productoVenta";
import { formatCurrency } from "../../utils/FacturaUtils";
import { toast } from "react-toastify";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from "@mui/icons-material/Article";
import ModalSearchClientes from "../../customers/search/ModalSearchClientes";
import { Cliente } from "../../models/cliente/Cliente";
import ModalSearchMfCotizacion from "../../customers/search/ModalSearchMfCotizacion";
import { CallReportById, CallReportByNumero } from "../../customers/search/CallReport";

export default function MfCotizacionView() {
    const [save, setSave] = useState<boolean>(false);
    const [retencionValue, setRetencionValue] = useState<number>(0);

    const cotizacionForm = useForm<Cotizacion>({
        defaultValues: {
            usuarioReg: "",
            fechaReg: undefined,
            activo: true,
            razonSocial: "",
            secuencia: undefined,
            rnc: "",
            tipoComprobanteId: "32",
            nota: "",
            id: 0,
            clienteId: 0,
            monto: 0,
            descuento: 0,
            itbis: 0,
            retencionId: 0,
            retencionItbis: 0,
            retencionIsr: 0,
            total: 0,
            detalles: [],
        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = cotizacionForm;

    useEffect(() => { }, []);

    const cotizacionDetalleItbis = (producto: ProductoVenta, detalle: CotizacionDetalle, retencion: number): CotizacionDetalle => {
        let montoTotal = (producto.precioItbis + producto.precioVenta) * detalle.cantidad;
        let montoItbis = producto.precioItbis * detalle.cantidad;
        let precioVentaUnd = producto.precioVenta;
        let montoVenta = precioVentaUnd * detalle.cantidad;

        detalle.precioVenta = precioVentaUnd;
        detalle.precioVentaUnd = precioVentaUnd;
        detalle.montoItbis = montoItbis;
        detalle.montoVenta = montoVenta;
        detalle.montoTotal = montoTotal;
        if (retencion > 0) {
            detalle.retencionIsr = 0;
            detalle.retencionItbis = (montoItbis * retencion) / 100;
        }

        return detalle;
    };

    const onSubmit: SubmitHandler<Cotizacion> = (data) => {
        const detalles = watch("detalles") || [];
        const monto = detalles.reduce((acc, row) => acc + (row.montoVenta || 0), 0);
        const itbis = detalles.reduce((acc, row) => acc + (row.montoItbis || 0), 0);
        const retencionItbis = detalles.reduce((acc, row) => acc + (row.retencionItbis || 0), 0);
        const retencionIsr = detalles.reduce((acc, row) => acc + (row.retencionIsr || 0), 0);
        const total = detalles.reduce((acc, row) => acc + (row.montoTotal || 0), 0);

        data.monto = monto;
        data.itbis = itbis;
        data.retencionItbis = retencionItbis;
        data.retencionIsr = retencionIsr;
        data.total = total;

        saveCotizacion(data)
            .then((response) => {
                setValue("id", response.id);
                setValue("secuencia", response.secuencia);

                if (Number(response.id) > 0) {
                    toast.success("Cotización guardada correctamente");
                    setSave(true);
                } else {
                    toast.error("Error al guardar la cotización");
                }
            })
            .catch((error) => {
                console.error("Error al guardar la cotización:", error);
                toast.error("Error al guardar la cotización");
            });
    };

    const onError = (errors: FieldErrors<Cotizacion>) => {
        toast.error("Errores de validación");
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("secuencia", undefined);
        setValue("clienteId", 0);
        setValue("razonSocial", "");
        setValue("rnc", "");
        setValue("monto", 0);
        setValue("descuento", 0);
        setValue("itbis", 0);
        setValue("retencionId", 0);
        setValue("retencionItbis", 0);
        setValue("retencionIsr", 0);
        setValue("total", 0);
        setValue("tipoComprobanteId", "32");
        setValue("usuarioReg", "");
        setValue("fechaReg", undefined);
        setValue("activo", true);
        setValue("detalles", []);
        setValue("nota", "");
        setSave(false);
    };

    const handleOnSelect = (row: any) => {
        Object.entries(row).forEach(([key, value]) => setValue(key as any, value));
    };

    const handleOnDelete = (row: CotizacionDetalle) => {
        let detalles = watch("detalles");
        detalles = detalles.filter((detalle) => detalle.linea !== row.linea);
        setValue("detalles", detalles);
    };

    const handleSelectProducto = (producto: ProductoVenta) => {
        let detalleCotizacion: CotizacionDetalle = {
            linea: 0,
            productoId: producto.id,
            producto: producto,
            productoDesc: producto.nombreProducto,
            precioCosto: producto.precioCostoAvg,
            precioVentaUnd: 0,
            precioVenta: 0,
            montoDescuento: 0,
            precioItbis: 0,
            cantidad: 1,
            montoVenta: 0,
            itbisId: producto.itbisId.id,
            montoItbis: 0,
            retencionItbis: 0,
            retencionIsr: 0,
        };
        let detalles = watch("detalles");
        detalles.push(detalleCotizacion);
        detalleCotizacion = cotizacionDetalleItbis(producto, detalleCotizacion, retencionValue);
        detalleCotizacion.linea = detalles.length;
        toast.success("Producto agregado a la cotización");

        setValue("detalles", detalles);
    };

    function handleOnChangeCantidad(value: string, row: any, column: string) {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            return;
        }
        let detalles = watch("detalles");
        let detalle = detalles[row.linea - 1];
        detalle.cantidad = Number(value);
        detalle = cotizacionDetalleItbis(detalle.producto!, detalle, retencionValue);
        detalles[row.linea - 1] = detalle;
        setValue("detalles", detalles);
    }

    function handleSelectCliente(cliente: Cliente): void {
        setValue("clienteId", cliente.secuencia);
        setValue("razonSocial", cliente.razonSocial);
        setValue("rnc", cliente.numeroIdentificacion.replaceAll("-", ""));
        setValue("tipoComprobanteId", cliente.tipoComprobanteId.toString());
    }

    function handleSelectRetenciones(retencion: MgRetencion): void {
        let detalles = watch("detalles");
        setRetencionValue(retencion?.valor || 0);
        detalles = detalles.map((detalle) => cotizacionDetalleItbis(detalle.producto!, detalle, retencion?.valor || 0));
        setValue("retencionId", retencion?.id || 0);
        setValue("detalles", detalles);
    }

    function handleSelectTipoComprobante(selected: any): void {
        setValue("tipoComprobanteId", selected.tipoComprobante);
    }

    const handleSearchCotizacion = (cotizacion: ICotizacionResumen) => {
        getByNumeroCotizacion(Number(cotizacion.secuencia)).then((response) => {
            if (response) {
                setValue("id", response.id);
                setValue("secuencia", response.secuencia);
                setValue("tipoComprobanteId", response.tipoComprobanteId || "");
                setValue("clienteId", response.clienteId || 0);
                setValue("razonSocial", response.razonSocial || "");
                setValue("rnc", response.rnc || "");
                setValue("monto", response.monto || 0);
                setValue("descuento", response.descuento || 0);
                setValue("itbis", response.itbis || 0);
                setValue("retencionId", response.retencionId || 0);
                setValue("retencionItbis", response.retencionItbis || 0);
                setValue("retencionIsr", response.retencionIsr || 0);
                setValue("total", response.total || 0);
                setValue("detalles", response.detalles || []);
                setValue("nota", response.nota || "");
                setValue("activo", response.activo);
                toast.success("Cotización cargada correctamente");
            } else {
                toast.error("Cotización no encontrada");
            }
        });
    };

    const handleGenerateReport = () => {

        const id = Number(watch("id"));

        console.log("cotizacion id:", id)

        if (id > 0) {
            CallReportByNumero("api/v1/facturacion/cotizaciones/reporte", id);
        }
    }

    return (
        <main style={{ display: "flex", flexDirection: "row", gap: 20, padding: 10 }}>
            <ListaProductoVenta onSelectProducto={handleSelectProducto} />

            <form style={{ flexGrow: 1, minWidth: "50%" }} onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Cotización">
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={save}
                    >
                        <SaveIcon /> Guardar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        <ArticleIcon /> Nuevo
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleGenerateReport}>
                        <ArticleIcon /> Reporte
                    </Button>
                </ActionBar>

                <fieldset disabled={save}>
                    <Grid container spacing={2} style={{ padding: 20 }}>
                        <GridRow>
                            <ModalSearchMfCotizacion control={control} name="secuencia" label="No. Cotización" size={2} onSelect={handleSearchCotizacion} />
                            <TipoComprobanteSelect
                                disabled={save}
                                control={control}
                                name="tipoComprobanteId"
                                label="Tipo Comprobante ID"
                                categoria="F"
                                rules={{
                                    required: "Debe seleccionar un tipo de comprobante",
                                    validate: (value: any) =>
                                        (value !== 0 && value !== "0") || "Debe seleccionar un tipo de comprobante",
                                }}
                                error={errors.tipoComprobanteId}
                                size={5}
                                handleGetItem={handleSelectTipoComprobante}
                            />
                            <RetencionesSelect
                                disabled={save}
                                control={control}
                                name="retencion"
                                label="retencion"
                                rules={{
                                    required: "Debe seleccionar retenciones",
                                    validate: (value: any) =>
                                        (value !== 0 && value !== "0") || "Debe seleccionar retenciones",
                                }}
                                size={5}
                                handleGetItem={handleSelectRetenciones}
                            />
                        </GridRow>
                        <GridRow>
                            <ModalSearchClientes
                                control={control}
                                name="clienteId"
                                label="Cliente ID"
                                size={2}
                                onSelect={handleSelectCliente}
                                pk={false}
                            />
                            <TextInput
                                disabled={save}
                                control={control}
                                name="razonSocial"
                                label="Razón Social"
                                error={errors.razonSocial}
                                rules={{
                                    required: "Debe seleccionar un cliente",
                                    minLength: {
                                        value: 3,
                                        message: "Debe tener al menos 3 caracteres",
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "Debe tener menos de 100 caracteres",
                                    },
                                }}
                                size={6}
                            />
                            <TextInput
                                disabled={save}
                                control={control}
                                name="rnc"
                                label="RNC"
                                error={errors.rnc}
                                rules={{
                                    required: "Debe seleccionar un cliente",
                                    minLength: {
                                        value: 7,
                                        message: "Debe tener al menos 7 caracteres",
                                    },
                                    maxLength: {
                                        value: 11,
                                        message: "Debe tener menos de 11 caracteres",
                                    },
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "Debe tener solo numeros",
                                    },
                                }}
                                size={4}
                            />
                        </GridRow>
                        <GridRow>
                            <TextInput
                                disabled={save}
                                control={control}
                                name="nota"
                                label="Nota"
                                error={errors.nota}
                                rules={{
                                    maxLength: {
                                        value: 250,
                                        message: "Debe tener menos de 250 caracteres",
                                    },
                                }}
                                size={12}
                            />
                        </GridRow>
                    </Grid>
                    <Divider>Listado</Divider>
                    <TableComponentFacturacion
                        disabled={save}
                        selected={handleOnSelect}
                        rows={watch("detalles")}
                        handleDelete={handleOnDelete}
                        columns={[
                            { id: "linea", label: "Linea" },
                            { id: "productoId", label: "Producto ID" },
                            { id: "productoDesc", label: "Producto" },
                            { id: "precioVentaUnd", label: "Precio Venta Und", format: (value: number) => formatCurrency(value) },
                            { id: "montoDescuento", label: "Monto Descuento", format: (value: number) => formatCurrency(value) },
                            {
                                id: "cantidad",
                                label: "Cantidad",
                                onChange: (value: string, row: any, column: string) => handleOnChangeCantidad(value, row, column),
                            },
                            { id: "montoVenta", label: "Monto Venta", format: (value: number) => formatCurrency(value) },
                            { id: "montoItbis", label: "Monto ITBIS", format: (value: number) => formatCurrency(value) },
                            { id: "retencionIsr", label: "Retencion ISR", format: (value: number) => formatCurrency(value) },
                            { id: "retencionItbis", label: "Retencion Itbis", format: (value: number) => formatCurrency(value) },
                            { id: "montoTotal", label: "Total", format: (value: number) => formatCurrency(value) },
                        ]}
                    />
                </fieldset>
            </form>
        </main>
    );
}
