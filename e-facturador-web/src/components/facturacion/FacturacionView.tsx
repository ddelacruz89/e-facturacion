import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Factura, TipoFactura } from "../../models/facturacion";
import { Button, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TextInput, TextInputPk, TableComponent, GridRow } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { TipoComprobanteSelect, TipoFacturaSelect } from "../../customers/ComboBox";
// import { saveFactura, getFacturas } from "../../apis/FacturaController";

export default function FacturacionView() {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<Factura>({
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

    const [facturas, setFacturas] = useState<Factura[]>([]);

    useEffect(() => {
        // getFacturas().then((data) => setFacturas(data));
    }, []);

    const onSubmit: SubmitHandler<Factura> = (data) => {
        // saveFactura(data).then((response) => {
        //     Object.keys(response).forEach(key => setValue(key as any, response[key]));
        //     alert("Factura guardada correctamente");
        // }).catch((error) => {
        //     console.error("Error al guardar la factura:", error);
        //     alert("Error al guardar la factura");
        // });
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
        setValue('id', 0);
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
    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title='Factura'>
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="contained" color="primary" onClick={handleClean}>Nuevo</Button>
                </ActionBar>

                <Grid container spacing={2} style={{ padding: 20 }}>
                    <GridRow>
                        <TextInputPk
                            readOnly
                            control={control}
                            name="numeroFactura"
                            label="No. Factura"
                            error={errors.numeroFactura}
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
                <TableComponent
                    selected={handleOnSelect}
                    rows={facturas}
                    columns={[
                        { id: "id", label: "ID" },
                        { id: "numeroFactura", label: "No. Factura" },
                        { id: "razonSocial", label: "Razón Social" },
                        { id: "rnc", label: "RNC" },
                        { id: "total", label: "Total" }
                    ]}
                />
            </form>
        </main>
    )
};