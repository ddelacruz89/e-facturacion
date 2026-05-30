import { Controller, useForm } from "react-hook-form"
import { Cliente } from "../../models/cliente/Cliente"
import { saveCliente } from "../../apis/ClienteController";
import ActionBar from "../../customers/ActionBar";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    FormControl,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { EmailInput, GridRow, MoneyInput, NumberInput, SwitchInput, TextInput } from "../../customers/CustomComponents";
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
            direccionEntrega: "",
            sector: "",
            ciudad: "",
            referencia: "",
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
        setValue("direccionEntrega", "");
        setValue("sector", "");
        setValue("ciudad", "");
        setValue("referencia", "");
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
        setValue("direccionEntrega", cliente.direccionEntrega ?? "");
        setValue("sector", cliente.sector ?? "");
        setValue("ciudad", cliente.ciudad ?? "");
        setValue("referencia", cliente.referencia ?? "");
        setValue("email", cliente.email);
        setValue("credito", cliente.credito);
        setValue("activo", cliente.activo);
        setValue("aplicaCredito", cliente.aplicaCredito);
        setValue("porcientoDescuento", cliente.porcientoDescuento);
        setValue("tipoComprobanteId", cliente.tipoComprobanteId);
    }

    return (
        <main>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Clientes">
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
                        <TextInput control={control} name="direccion" label="Direccion Fiscal" size={8} />
                    </GridRow>
                    <GridRow>
                        <MoneyInput control={control} name="credito" label="Credito" size={4} prefix="RD$" />
                        <NumberInput control={control} name="porcientoDescuento" label="Porciento Descuento" size={4} />
                    </GridRow>
                    <GridRow>
                        <SwitchInput control={control} name="activo" label="Activo" size={4} />
                        <SwitchInput control={control} name="aplicaCredito" label="Aplica Credito" size={4} />
                    </GridRow>

                    {/* Sección colapsable: Dirección de Entrega */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1" fontWeight={500}>
                                    Dirección de Entrega
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mt: 0.3 }}>
                                    — opcional, para organizar rutas de despacho
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <GridRow>
                                        <TextInput
                                            control={control}
                                            name="direccionEntrega"
                                            label="Dirección de Entrega"
                                            size={8}
                                        />
                                    </GridRow>
                                    <GridRow>
                                        <TextInput
                                            control={control}
                                            name="sector"
                                            label="Sector / Barrio"
                                            size={4}
                                        />
                                        <TextInput
                                            control={control}
                                            name="ciudad"
                                            label="Ciudad"
                                            size={4}
                                        />
                                    </GridRow>
                                    <GridRow>
                                        <Grid size={{ xs: 12, sm: 8 }}>
                                            <Controller
                                                name="referencia"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth>
                                                        <TextField
                                                            {...field}
                                                            label="Referencia / Indicaciones al conductor"
                                                            variant="outlined"
                                                            size="small"
                                                            multiline
                                                            rows={2}
                                                            fullWidth
                                                        />
                                                    </FormControl>
                                                )}
                                            />
                                        </Grid>
                                    </GridRow>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </form>
        </main>
    )
}
