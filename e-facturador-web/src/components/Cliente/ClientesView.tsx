import { set, useForm } from "react-hook-form"
import { Cliente } from "../../models/cliente/Cliente"
import { useEffect } from "react";
import { getClientes, saveCliente } from "../../apis/ClienteController";
import ActionBar from "../../customers/ActionBar";
import { Button, Grid } from "@mui/material";
import { EmailInput, GridRow, MoneyInput, NumberInput, SwitchInput, TextInput, TextInputPk } from "../../customers/CustomComponents";
import { TipoComprobanteSelect, TipoIdentificacionSelect } from "../../customers/ComboBox";
import { toast } from "react-toastify";
import ModalSearchClientes from "../../customers/search/ModalSearchClientes";

export default function ClientesView() {
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<Cliente>({
        defaultValues: {
            id: 0,
            empresaId: 0,
            secuencia: 0,
            tipoIdentificacion: 0,
            numeroIdentificacion: "",
            razonSocial: "",
            telefono: "",
            direccion: "",
            email: "",
            credito: 0,
            activo: true,
            aplicaCredito: false,
            porcientoDescuento: 0,
            tipoComprobanteId: 0
        }
    });

    const onSubmit = (data: Cliente) => {
        saveCliente(data).then((data) => {
            if (data) {
                if (data.id > 0) {
                    toast.success("Cliente guardado correctamente");
                    setValue("id", data.id);
                    setValue("secuencia", data.secuencia);
                }
            }
        }).catch((error) => {
            toast.error("Error al guardar el cliente");
        });
    }

    function handleClean() {
        setValue("id", 0);
        setValue("empresaId", 0);
        setValue("secuencia", 0);
        setValue("tipoIdentificacion", 0);
        setValue("numeroIdentificacion", "");
        setValue("razonSocial", "");
        setValue("telefono", "");
        setValue("direccion", "");
        setValue("email", "");
        setValue("credito", 0);
        setValue("activo", true);
        setValue("aplicaCredito", false);
        setValue("porcientoDescuento", 0);
    }

    function handleSelectCliente(cliente: Cliente): void {
        setValue("id", cliente.id);
        setValue("empresaId", cliente.empresaId);
        setValue("secuencia", cliente.secuencia);
        setValue("tipoIdentificacion", cliente.tipoIdentificacion);
        setValue("numeroIdentificacion", cliente.numeroIdentificacion);
        setValue("razonSocial", cliente.razonSocial);
        setValue("telefono", cliente.telefono);
        setValue("direccion", cliente.direccion);
        setValue("email", cliente.email);
        setValue("credito", cliente.credito);
        setValue("activo", cliente.activo);
        setValue("aplicaCredito", cliente.aplicaCredito);
        setValue("porcientoDescuento", cliente.porcientoDescuento);
        setValue("tipoComprobanteId", cliente.tipoComprobanteId);
    }

    return (
        <main >
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Clientes" >
                    <Button variant="contained" color="primary" onClick={handleClean}>
                        Limpiar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
                        Guardar
                    </Button>

                </ActionBar>

                <Grid container spacing={2} className="p-2">
                    <GridRow>
                        <ModalSearchClientes control={control} name="secuencia" label="Secuencia" size={2} onSelect={handleSelectCliente} />
                    </GridRow>
                    <GridRow>
                        <TipoIdentificacionSelect control={control} name="tipoIdentificacion" label="Tipo Identificacion" size={4} />
                        <TextInput control={control} name="numeroIdentificacion" label="Numero Identificacion" size={4} />
                    </GridRow>
                    <GridRow>
                        <TextInput control={control} name="razonSocial" label="Razon Social" size={4} />
                        <TipoComprobanteSelect control={control} name="tipoComprobanteId" label="Tipo Comprobante" size={4} />
                    </GridRow>
                    <GridRow>
                        <TextInput control={control} name="telefono" label="Telefono" size={4} />

                        <EmailInput control={control} name="email" label="Email" size={4} />
                    </GridRow>
                    <GridRow>
                        <MoneyInput control={control} name="credito" label="Credito" size={4} prefix="RD$" />
                        <NumberInput control={control} name="porcientoDescuento" label="Porciento Descuento" size={4} />
                    </GridRow>
                    <GridRow>
                        <SwitchInput control={control} name="activo" label="Activo" size={4} />
                        <SwitchInput control={control} name="aplicaCredito" label="Aplica Credito" size={4} />
                    </GridRow>
                </Grid>
            </form>
        </main>
    )
}