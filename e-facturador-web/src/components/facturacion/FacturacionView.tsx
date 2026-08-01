import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch, Controller, Control, SubmitHandler, FieldErrors, useFieldArray } from "react-hook-form";
import { Factura, FacturaDetalle, IFacturaResumen, MgRetencion, TipoFactura } from "../../models/facturacion";
import { Button, Checkbox, Divider, FormControlLabel } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TextInput, GridRow, TableComponentFacturacion } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { RetencionesSelect, TipoComprobanteSelect, TipoFacturaSelect } from "../../customers/ComboBox";
import { saveFactura, getFacturaById, getFacturaSender } from "../../apis/FacturaController";
import ListaProductoVenta from "./ListaProductoVenta";
import { ProductoVenta } from "../../models/producto/productoVenta";
import { detalleItbis, formatCurrency } from "../../utils/FacturaUtils";
import { toast } from "react-toastify";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from "@mui/icons-material/Article";
import ModalSearchClientes from "../../customers/search/ModalSearchClientes";
import { Cliente } from "../../models/cliente/Cliente";
import ModalSearchFacturas from "../../customers/search/ModalSearchFacturas";
import ModalReciboPago from "./modals/ModalReciboPago";
import { CallReportById } from "../../customers/search/CallReport";

export default function FacturacionView() {

    const [save, setSave] = useState<boolean>(false)
    const [openModalReciboPago, setOpenModalReciboPago] = useState<boolean>(false)
    const facturaForm = useForm<Factura>({
        defaultValues: {
            usuarioReg: "",
            fechaReg: undefined,
            activo: true,
            aprobada: false,
            razonSocial: "",
            rnc: "",
            tipoComprobanteId: "32",
            ncf: "",
            id: 0,
            numeroFactura: 0,
            tipoFacturaId: 1,
            clienteId: 0,
            monto: 0,
            descuento: 0,
            itbis: 0,
            retencionId: 0,
            retencionItbis: 0,
            retencionIsr: 0,
            total: 0,
            detalles: [],
            envio: false,
            nota: "",
        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = facturaForm

    const {
        fields,
        append,
        remove,
        update,
        replace
    } = useFieldArray({
        control,
        name: "detalles"
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

    useEffect(() => { }, []);

    // No es estado reactivo: solo se lee dentro de callbacks (nunca en el JSX),
    // así su cambio no re-renderiza FacturacionView ni rompe el React.memo de ListaProductoVenta.
    const retencionValueRef = useRef<number>(0);

    const onSubmit: SubmitHandler<Factura> = (data) => {
        setOpenModalReciboPago(false);

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
                setSave(true)
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
        toast.error("Errores de validación");
        console.log("Errores de validación:", errors);
    };

    const handleClean = () => {
        setValue("id", undefined);
        setValue("secuencia", undefined);
        setValue("numeroFactura", 0);
        setValue("clienteId", 0);
        setValue("tipoFacturaId", 1);
        setValue("razonSocial", "");
        setValue("rnc", "");
        setValue("monto", 0);
        setValue("descuento", 0);
        setValue("itbis", 0);
        setValue("retencionItbis", 0);
        setValue("retencionIsr", 0);
        setValue("total", 0);
        setValue("ncf", "");
        setValue("tipoComprobanteId", "32");
        setValue("empresaId", 0);
        setValue("aprobada", false);
        setValue("qrUrl", "");
        setValue("trackId", "");
        setValue("usuarioReg", "");
        setValue("fechaReg", undefined);
        // setValue("recibo", { efectivo: 0, tarjeta: null, cheque: 0, transferencia: 0, otros: 0, notaCredito: 0, total: 0, cambio: 0 });
        setValue("activo", true);
        setValue("detalles", []);
        setValue("envio", false);
        setValue("nota", "");
        setSave(false)
    };

    const handleOnSelect = useCallback((row: Factura) => {
        Object.entries(row).forEach(([key, value]) => setValue(key as any, value));
    }, [setValue]);

    const handleOnDelete = useCallback((index: number) => {
        remove(index)
    }, [remove]);

    const handleSelectTipoFactura = (item: TipoFactura) => {
        setValue("tipoFacturaId", item?.id || 2);
    };

    const handleSelectProducto = useCallback((producto: ProductoVenta) => {
        // if (watch('detalles').find((detalle) => detalle.productoId === producto.id)) {
        //     toast.error("Producto ya agregado a la factura");
        //     return;
        // }

        let detalleFactura: FacturaDetalle = {
            linea: fields.length + 1,
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
            almacenId: 0,
        };
        append(detalleFactura);
        toast.success("Producto agregado a la factura");
    }, [append]);

    const handleOnChangeCantidad = useCallback((index: number, value: string, column: string) => {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            return;
        }
        const detalle = { ...fields[index], cantidad: Number(value) };
        const detalleActualizado = detalleItbis(detalle.producto!, detalle, retencionValueRef.current);
        update(index, detalleActualizado);
    }, [fields, retencionValueRef, update]);

    function handleSelectCliente(cliente: Cliente): void {
        setValue("clienteId", cliente.secuencia);
        setValue("razonSocial", cliente.razonSocial);
        setValue("rnc", cliente.numeroIdentificacion.replaceAll("-", ""));
        setValue("tipoComprobanteId", cliente.tipoComprobanteId.toString())
    }
    function handleSelectFactura(factura: IFacturaResumen): void {
        getFacturaById(factura.id).then((response) => {
            setValue("id", response?.id);
            setValue("secuencia", response?.secuencia);
            setValue("ncf", response?.ncf);
            setValue("tipoComprobanteId", response?.tipoComprobanteId || "");
            setValue("tipoFacturaId", response?.tipoFacturaId || 0);
            setValue("clienteId", response?.clienteId || 0);
            setValue("monto", response?.monto || 0);
            setValue("descuento", response?.descuento || 0);
            setValue("itbis", response?.itbis || 0);
            setValue("retencionItbis", response?.retencionItbis || 0);
            setValue("retencionIsr", response?.retencionIsr || 0);
            setValue("total", response?.total || 0);
            replace(response?.detalles || []);
            setValue("envio", response?.envio || false);
            setValue("nota", response?.nota || "");
        });
    }

    function handleSelectRetenciones(retencion: MgRetencion): void {

        retencionValueRef.current = retencion?.valor || 0;
        const detalles = fields.map((detalle) => detalleItbis(detalle.producto!, detalle, retencion?.valor || 0));
        setValue("retencionId", retencion?.id || 0);
        replace(detalles);
    }

    function handleSelectTipoComprobante(selected: any): void {
        setValue("tipoComprobanteId", selected.tipoComprobante)
    }
    const handleGenerateReport = () => {
        const id = Number(getValues("id"));
        if (id > 0) {
            CallReportById("reporte", id);
        }
    }

    function handleResend() {
        const id = Number(getValues("id"));
        if (id > 0) {
            getFacturaSender(id).then((response) => {
                console.log(response);
            });
        }
    }


    return (

        <main style={{ display: "flex", flexDirection: "row", gap: 20, padding: 10 }}>

            <ListaProductoVenta onSelectProducto={handleSelectProducto} />

            <form style={{ flexGrow: 1, minWidth: "50%" }} onSubmit={handleSubmit(onSubmit, onError)}>
                {openModalReciboPago && (
                    <ModalReciboPago facturaForm={facturaForm} isOpen={openModalReciboPago} onClose={() => { setOpenModalReciboPago(false) }} onConfirm={() => {
                        handleSubmit(onSubmit, onError)();
                        setOpenModalReciboPago(false)
                    }} />
                )}
                <ActionBar title="Factura">
                    <GuardarButton control={control} save={save} onOpenRecibo={() => setOpenModalReciboPago(true)} />
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        <ArticleIcon /> Nuevo
                    </Button>
                    {/* <Button variant="contained" color="warning" onClick={handleResend}>
                        <ArticleIcon /> Reenviar
                    </Button> */}
                    <Button variant="contained" color="primary" onClick={handleGenerateReport}>
                        <ArticleIcon /> Reporte
                    </Button>
                </ActionBar>
                <fieldset disabled={save}>

                    <Grid container spacing={2} style={{ padding: 20 }}>
                        <GridRow>
                            <ModalSearchFacturas control={control} name="secuencia" label="No. Factura" size={2} onSelect={handleSelectFactura} />
                            <TipoFacturaSelect
                                disabled={save}
                                control={control}
                                name="tipoFacturaId"
                                label="Tipo Factura ID"
                                error={errors.tipoFacturaId}
                                rules={{
                                    required: "Debe seleccionar un tipo de factura",
                                    validate: (value: any) => [1, 2, 3].includes(Number(value)) || "Debe seleccionar un tipo de factura entre 1 y 3",
                                }}
                                size={2}
                                handleGetItem={handleSelectTipoFactura}
                            />
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
                                // error={errors.retencion}
                                size={5}
                                handleGetItem={handleSelectRetenciones}
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
                                size={2}
                            />
                            <EnvioCheckbox control={control} save={save} />
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
                                size={6}
                            />
                        </GridRow>
                    </Grid>
                    <Divider>Listado</Divider>
                    <FacturaDetalleTable
                        fields={fields}
                        disabled={save}
                        selected={handleOnSelect}
                        handleDelete={handleOnDelete}
                        handleOnChangeCantidad={handleOnChangeCantidad}
                    />
                </fieldset>
            </form>
        </main>
    );
}

// Componentes aislados: cada uno se suscribe solo al campo que necesita vía useWatch/Controller,
// para que agregar un producto o cambiar un dropdown no re-renderice todo FacturacionView
// (incluyendo el catálogo de productos de la izquierda).

function GuardarButton({ control, save, onOpenRecibo }: { control: Control<Factura>; save: boolean; onOpenRecibo: () => void }) {
    const tipoFacturaId = useWatch({ control, name: "tipoFacturaId" });
    return tipoFacturaId === 2 ? (
        <Button variant="contained" color="success" type="submit" disabled={save}>
            {" "}
            <SaveIcon /> Guardar
        </Button>
    ) : (
        <Button variant="contained" color="warning" onClick={onOpenRecibo} disabled={save}>
            {" "}
            <SaveIcon /> Guardar
        </Button>
    );
}

function EnvioCheckbox({ control, save }: { control: Control<Factura>; save: boolean }) {
    return (
        <Grid size={2} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
                name="envio"
                control={control}
                render={({ field }) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                disabled={save}
                                color="primary"
                            />
                        }
                        label="Para Envío"
                    />
                )}
            />
        </Grid>
    );
}

function FacturaDetalleTable({
    fields,
    disabled,
    selected,
    handleDelete,
    handleOnChangeCantidad,
}: {
    fields: FacturaDetalle[];
    disabled: boolean;
    selected: (row: Factura) => void;
    handleDelete: (index: number) => void;
    handleOnChangeCantidad: (index: number, value: string, column: string) => void;
}) {
    return (
        <TableComponentFacturacion
            disabled={disabled}
            selected={selected}
            rows={fields}
            handleDelete={handleDelete}
            columns={[
                { id: "linea", label: "Linea" },
                { id: "productoId", label: "Producto ID" },
                { id: "productoDesc", label: "Producto" },
                { id: "precioVentaUnd", label: "Precio Venta Und", format: (value: number) => formatCurrency(value) },
                { id: "montoDescuento", label: "Monto Descuento", format: (value: number) => formatCurrency(value) },
                {
                    id: "cantidad",
                    label: "Cantidad",
                    onChange: (index: number, value: any, column: string) => handleOnChangeCantidad(index, value, column),
                    isNumeric: true,
                },
                { id: "montoVenta", label: "Monto Venta", format: (value: number) => formatCurrency(value) },
                { id: "montoItbis", label: "Monto ITBIS", format: (value: number) => formatCurrency(value) },
                { id: "retencionIsr", label: "Retencion ISR", format: (value: number) => formatCurrency(value) },
                { id: "retencionItbis", label: "Retencion Itbis", format: (value: number) => formatCurrency(value) },
                { id: "montoTotal", label: "Total", format: (value: number) => formatCurrency(value) },
            ]}
        />
    );
}
