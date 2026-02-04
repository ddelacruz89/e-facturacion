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

export default function FacturacionView() {
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<Factura>({
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
        }
    });

    const [factura, setFactura] = useState<Factura>({
        activo: true,
        empresaId: 0,
        trackId: "",
        qrUrl: "",
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
    });

    useEffect(() => {

    }, []);

    const onSubmit: SubmitHandler<Factura> = (data) => {
        debugger;
        saveFactura(data).then((response) => {
            toast.success("Factura guardada correctamente");
            factura.id = response.id;
            factura.secuencia = response.secuencia;
            setValue('id', response.id);
            setValue('secuencia', response.secuencia);

        }).catch((error) => {
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
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue('id', undefined);
        setValue('secuencia', undefined);
        setValue('numeroFactura', 0);
        setValue('clienteId', 0);
        setValue('tipoFacturaId', 0);
        setValue('razonSocial', '');
        setValue('rnc', '');
        setValue('monto', 0);
        setValue('descuento', 0);
        setValue('itbis', 0);
        setValue('retencionItbis', 0);
        setValue('retencionIsr', 0);
        setValue('total', 0);
        setValue('ncf', '');
        setValue('tipoComprobanteId', '');
        setValue('empresaId', 0);
        setValue('aprobada', false);
        setValue('qrUrl', '');
        setValue('trackId', '');
        setValue('usuarioReg', '');
        setValue('fechaReg', undefined);
        setValue('activo', true);
        setValue('detalles', []);


    };

    const handleOnSelect = (row: Factura) => {
        Object.entries(row).forEach(([key, value]) => setValue(key as any, value));
    };

    const handleSelectTipoFactura = (item: TipoFactura) => {
        console.log("TipoFactura", item)
    }

    const handleSelectProducto = (producto: ProductoVenta) => {

        if (factura.detalles.find((detalle) => detalle.productoId === producto.id)) {
            toast.error("Producto ya agregado a la factura");
            return;
        }

        let detalleFactura: FacturaDetalle = {
            linea: 0,
            productoId: producto.id,
            producto: producto,
            precioCosto: 0,
            precioVentaUnd: 0,
            precioVenta: 0,
            montoDescuento: 0,
            precioItbis: 0,
            cantidad: 2,
            montoVenta: 0,
            itbisId: 0,
            montoItbis: 0,
            retencionItbis: 0,
            retencionIsr: 0,
            almacenId: 0,
        };
        let detalles = factura.detalles
        detalles.push(detalleFactura);

        detalleFactura = detalleItbis(producto, detalleFactura);
        detalleFactura.linea = detalles.length;
        // factura.detalles = detalles;
        // setFactura({ ...factura, detalles: detalles });
        toast.success("Producto agregado a la factura");

        setValue('detalles', detalles);

    }
    function handleOnChangeCantidad(value: string, row: any, column: string) {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            return;
        }
        let detalles = factura.detalles;
        let detalle = detalles[row.linea - 1];
        detalle.cantidad = Number(value);
        detalle = detalleItbis(detalle.producto!, detalle);
        detalles[row.linea - 1] = detalle;
        setValue('detalles', detalles);

    }

    return (
        <main style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
            <ListaProductoVenta onSelectProducto={handleSelectProducto} />
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title='Factura'>
                    <Button variant="contained" color="primary" type="submit" disabled={factura.id !== undefined}>Guardar</Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>Nuevo</Button>
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
                            size={2}
                            handleGetItem={handleSelectTipoFactura}
                        />
                        <TipoComprobanteSelect
                            control={control}
                            name="tipoComprobanteId"
                            label="Tipo Comprobante ID"
                            error={errors.tipoComprobanteId}
                            size={5}
                            handleGetItem={handleSelectTipoFactura}
                        />
                        <TextInput
                            readOnly
                            control={control}
                            name="ncf"
                            label="NCF"
                            error={errors.ncf}
                            size={3}
                        />
                    </GridRow>
                    <GridRow>
                        <TextInput
                            control={control}
                            name="clienteId"
                            label="Cliente ID"
                            error={errors.clienteId}
                            size={2}
                        />
                        <TextInput
                            control={control}
                            name="razonSocial"
                            label="Razón Social"
                            error={errors.razonSocial}
                            size={6}
                        />
                        <TextInput
                            control={control}
                            name="rnc"
                            label="RNC"
                            error={errors.rnc}
                            size={2}
                        />
                    </GridRow>
                </Grid>
                <Divider>Listado</Divider>
                <TableComponentFacturacion
                    selected={handleOnSelect}
                    rows={watch('detalles')}
                    columns={[
                        { id: "linea", label: "Linea" },
                        { id: "productoId", label: "Producto ID" },
                        { id: "precioVentaUnd", label: "Precio Venta Und", format: (value: number) => formatCurrency(value) },
                        { id: "cantidad", label: "Cantidad", onChange: (value: string, row: any, column: string) => handleOnChangeCantidad(value, row, column) },
                        { id: "montoVenta", label: "Monto Venta", format: (value: number) => formatCurrency(value) },
                        { id: "montoItbis", label: "Monto ITBIS", format: (value: number) => formatCurrency(value) },
                        { id: "montoTotal", label: "Total", format: (value: number) => formatCurrency(value) }
                    ]}
                />
            </form>
        </main>
    )
};