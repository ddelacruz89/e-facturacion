import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Factura, FacturaDetalle, TipoFactura } from "../../models/facturacion";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TextInput, TextInputPk, TableComponent, GridRow, TableComponentFacturacion } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { TipoComprobanteSelect, TipoFacturaSelect } from "../../customers/ComboBox";
import { getProductosVentas, saveFactura } from "../../apis/FacturaController";
import ListaProductoVenta from "./ListaProductoVenta";
import { ProductoVenta } from "../../models/producto/productoVenta";
import { detalleItbis, formatCurrency } from "../../utils/FacturaUtils";
import { toast } from "react-toastify";
import { getValue } from "@testing-library/user-event/dist/utils";
// import { saveFactura, getFacturas } from "../../apis/FacturaController";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from "@mui/icons-material/Article";
import ModalSearchClientes from "../../customers/search/ModalSearchClientes";
import { Cliente } from "../../models/cliente/Cliente";

export default function FacturacionView() {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Factura>({
        defaultValues: {
            usuarioReg: "",
            fechaReg: undefined,
            activo: true,
            aprobada: false,
            razonSocial: "",
            rnc: "",
            tipoComprobanteId: "",
            ncf: "",
            id: 0,
            numeroFactura: 0,
            tipoFacturaId: 0,
            clienteId: 0,
            monto: 0,
            descuento: 0,
            itbis: 0,
            retencionItbis: 0,
            retencionIsr: 0,
            total: 0,
            detalles: [],
        },
    });

    // const [factura, setFactura] = useState<Factura>({
    //     activo: true,
    //     empresaId: 0,
    //     trackId: "",
    //     qrUrl: "",
    //     aprobada: false,
    //     razonSocial: "",
    //     rnc: "",
    //     tipoComprobanteId: "",
    //     ncf: "",
    //     id: 0,
    //     numeroFactura: 0,
    //     tipoFacturaId: 0,
    //     clienteId: 0,
    //     monto: 0,
    //     descuento: 0,
    //     itbis: 0,
    //     retencionItbis: 0,
    //     retencionIsr: 0,
    //     total: 0,
    //     detalles: [],
    // });

    useEffect(() => {}, []);

    const onSubmit: SubmitHandler<Factura> = (data) => {
        debugger;
        saveFactura(data)
            .then((response) => {
                setValue("id", response.id);
                setValue("secuencia", response.secuencia);
                setValue("ncf", response.ncf);

                if (Number(response.id) > 0) {
                    toast.success("Factura guardada correctamente");
                } else {
                    toast.error("Error al guardar la factura");
                }
                setValue("id", response.id);
                setValue("secuencia", response.secuencia);
            })
            .catch((error) => {
                console.error("Error al guardar la factura:", error);
                toast.error("Error al guardar la factura");
            });
        if (data.id) {
            console.log("Factura actualizada", data);
        } else {
            console.log("Factura guardada", data);
        }
    };

    const onError = (errors: FieldErrors<Factura>) => {
        debugger;
        toast.error("Errores de validación");
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("secuencia", undefined);
        setValue("numeroFactura", 0);
        setValue("clienteId", 0);
        setValue("tipoFacturaId", 0);
        setValue("razonSocial", "");
        setValue("rnc", "");
        setValue("monto", 0);
        setValue("descuento", 0);
        setValue("itbis", 0);
        setValue("retencionItbis", 0);
        setValue("retencionIsr", 0);
        setValue("total", 0);
        setValue("ncf", "");
        setValue("tipoComprobanteId", "");
        setValue("empresaId", 0);
        setValue("aprobada", false);
        setValue("qrUrl", "");
        setValue("trackId", "");
        setValue("usuarioReg", "");
        setValue("fechaReg", undefined);
        setValue("activo", true);
        setValue("detalles", []);
    };

    const handleOnSelect = (row: Factura) => {
        Object.entries(row).forEach(([key, value]) => setValue(key as any, value));
    };

    const handleOnDelete = (row: FacturaDetalle) => {
        let detalles = watch("detalles");
        detalles = detalles.filter((detalle) => detalle.linea !== row.linea);
        setValue("detalles", detalles);
    };

    const handleSelectTipoFactura = (item: TipoFactura) => {
        console.log("TipoFactura", item);
    };

    const handleSelectProducto = (producto: ProductoVenta) => {
        // if (watch('detalles').find((detalle) => detalle.productoId === producto.id)) {
        //     toast.error("Producto ya agregado a la factura");
        //     return;
        // }

        let detalleFactura: FacturaDetalle = {
            linea: 0,
            productoId: producto.id,
            producto: producto,
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
            almacenId: 0,
        };
        let detalles = watch("detalles");
        detalles.push(detalleFactura);

        detalleFactura = detalleItbis(producto, detalleFactura);
        detalleFactura.linea = detalles.length;
        toast.success("Producto agregado a la factura");

        setValue("detalles", detalles);
    };
    function handleOnChangeCantidad(value: string, row: any, column: string) {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            return;
        }
        let detalles = watch("detalles");
        let detalle = detalles[row.linea - 1];
        detalle.cantidad = Number(value);
        detalle = detalleItbis(detalle.producto!, detalle);
        detalles[row.linea - 1] = detalle;
        setValue("detalles", detalles);
    }

    function handleSelectCliente(cliente: Cliente): void {
        setValue("clienteId", cliente.id);
        setValue("razonSocial", cliente.razonSocial);
        setValue("rnc", cliente.numeroIdentificacion);
    }

    return (
        <main style={{ display: "flex", flexDirection: "row", gap: 20, padding: 10 }}>
            <ListaProductoVenta onSelectProducto={handleSelectProducto} />
            <form style={{ flexGrow: 1 }} onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Factura">
                    <Button
                        variant="contained"
                        color="success"
                        type="submit"
                        disabled={Number(watch("id")) !== 0 || watch("detalles").length === 0}>
                        {" "}
                        <SaveIcon /> Guardar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        <ArticleIcon /> Nuevo
                    </Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <GridRow>
                        <TextInputPk
                            readOnly
                            control={control}
                            name="secuencia"
                            label="No. Factura"
                            error={errors.secuencia}
                            size={2}
                        />
                        <TipoFacturaSelect
                            control={control}
                            name="tipoFacturaId"
                            label="Tipo Factura ID"
                            error={errors.tipoFacturaId}
                            rules={{
                                required: "Debe seleccionar un tipo de factura",
                                validate: (value: any) => (value !== 0 && value !== "0") || "Debe seleccionar un tipo de factura",
                            }}
                            size={2}
                            handleGetItem={handleSelectTipoFactura}
                        />
                        <TipoComprobanteSelect
                            control={control}
                            name="tipoComprobanteId"
                            label="Tipo Comprobante ID"
                            rules={{
                                required: "Debe seleccionar un tipo de comprobante",
                                validate: (value: any) =>
                                    (value !== 0 && value !== "0") || "Debe seleccionar un tipo de comprobante",
                            }}
                            error={errors.tipoComprobanteId}
                            size={5}
                            handleGetItem={handleSelectTipoFactura}
                        />
                        <TextInput readOnly control={control} name="ncf" label="NCF" error={errors.ncf} size={3} />
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
                        {/* <TextInput
                            control={control}
                            name="clienteId"
                            label="Cliente ID"
                            error={errors.clienteId}
                            rules={{
                                required: "Debe seleccionar un cliente",
                                validate: (value: any) => (Number(value) === 0 && Number(watch('tipoComprobanteId')) !== 32) || "Debe seleccionar un cliente"
                            }}
                            size={2}
                        /> */}
                        <TextInput
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
                            size={2}
                        />
                    </GridRow>
                </Grid>
                <Divider>Listado</Divider>
                <TableComponentFacturacion
                    selected={handleOnSelect}
                    rows={watch("detalles")}
                    handleDelete={handleOnDelete}
                    columns={[
                        { id: "linea", label: "Linea" },
                        { id: "productoId", label: "Producto ID" },
                        { id: "precioVentaUnd", label: "Precio Venta Und", format: (value: number) => formatCurrency(value) },
                        {
                            id: "cantidad",
                            label: "Cantidad",
                            onChange: (value: string, row: any, column: string) => handleOnChangeCantidad(value, row, column),
                        },
                        { id: "montoVenta", label: "Monto Venta", format: (value: number) => formatCurrency(value) },
                        { id: "montoItbis", label: "Monto ITBIS", format: (value: number) => formatCurrency(value) },
                        { id: "montoTotal", label: "Total", format: (value: number) => formatCurrency(value) },
                    ]}
                />
            </form>
        </main>
    );
}
