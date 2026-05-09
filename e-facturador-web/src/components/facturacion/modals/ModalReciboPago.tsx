import { CheckCircle, Cancel, AddCircle, AccountBalanceWallet } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, Grid, Box, Card, CardContent, Divider, IconButton, Tooltip } from "@mui/material";
import { Factura, FacturaDetalle } from "../../../models/facturacion";
import { UseFormReturn } from "react-hook-form";
import { MoneyInput } from "../../../customers/CustomMUIComponents";
import { TextInput } from "../../../customers/CustomComponents";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    facturaForm: UseFormReturn<Factura>;
}

export default function ModalReciboPago({ isOpen, onClose, onConfirm, facturaForm }: Props) {

    const {
        control,
        setValue,
        watch,
        formState: { errors },
    } = facturaForm;

    const handleClose = () => {
        onClose();
    }

    const handleConfirm = () => {
        onConfirm();
    }

    const recibo = watch("recibo");
    const detalles: FacturaDetalle[] = watch("detalles");
    const totalFactura = detalles.reduce((acc, row) => acc + (Number(row.montoTotal) || 0), 0);
    const retencionItbis = detalles.reduce((acc, row) => acc + (Number(row.retencionItbis) || 0), 0);
    const montoPagar = totalFactura - retencionItbis;
    const pagos = [
        recibo?.efectivo,
        recibo?.tarjeta,
        recibo?.cheque,
        recibo?.transferencia,
        recibo?.otros,
        recibo?.notaCredito
    ];

    const totalPagado = pagos.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const restante = montoPagar - totalPagado;

    const handleAddRemaining = (fieldName: any) => {
        if (restante > 0) {
            const currentVal = Number(watch(fieldName)) || 0;
            setValue(fieldName, currentVal + restante, { shouldValidate: true, shouldDirty: true });
        }
    };

    const renderPaymentField = (name: any, label: string) => {
        const fieldName = name.split('.')[1];
        return (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} display="flex" alignItems="flex-start" gap={1}>
                <Box flex={1}>
                    <MoneyInput
                        name={name}
                        control={control}
                        label={label}
                        error={(errors.recibo as any)?.[fieldName]}
                        rules={{ required: `${label} es requerido` }}
                        size={12}
                    />
                </Box>
                <Tooltip title="Agregar restante a este campo">
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => handleAddRemaining(name)}
                            disabled={restante <= 0}
                            sx={{ mt: 0.5 }}
                        >
                            <AddCircle />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
        );
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    padding: 1,
                    bgcolor: 'background.default'
                },
            }}>
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    paddingBottom: 2,
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: 'primary.main',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 2
                }}>
                <AccountBalanceWallet fontSize="large" />
                Recibo de Pago
            </DialogTitle>

            <DialogContent sx={{ pb: 3, pt: 1 }}>
                <Grid container spacing={3}>
                    {/* Sección de Campos de Pago */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                            Métodos de Pago
                        </Typography>
                        <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                            <Grid container spacing={2}>
                                {renderPaymentField("recibo.efectivo", "Efectivo")}
                                {renderPaymentField("recibo.tarjeta", "Tarjeta")}
                                {renderPaymentField("recibo.cheque", "Cheque")}
                                {renderPaymentField("recibo.transferencia", "Transferencia")}
                                {renderPaymentField("recibo.otros", "Otros")}
                                {renderPaymentField("recibo.notaCredito", "Nota de crédito")}

                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                    <Box mt={1}>
                                        <TextInput
                                            size={12}
                                            name="recibo.comentario"
                                            control={control}
                                            label="Comentario"
                                            error={errors.recibo?.comentario}
                                            rules={{ required: "Comentario es requerido" }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>

                    {/* Sección de Resumen */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                            Resumen de Factura
                        </Typography>
                        <Card
                            elevation={4}
                            sx={{
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                                height: '100%',
                                minHeight: 250
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" color="text.secondary">Total Factura:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        RD$ {totalFactura.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" color="text.secondary">Retencion ITBIS:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        RD$ {retencionItbis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" color="text.secondary">Total a Pagar:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        RD$ {montoPagar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" color="text.secondary">Total Pagado:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                                        RD$ {totalPagado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 'auto',
                                    p: 2,
                                    bgcolor: restante > 0 ? 'error.light' : (restante < 0 ? 'warning.light' : 'success.light'),
                                    color: restante > 0 ? 'error.contrastText' : (restante < 0 ? 'warning.contrastText' : 'success.contrastText'),
                                    borderRadius: 2
                                }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {restante < 0 ? 'Cambio:' : 'Restante:'}
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        RD$ {Math.abs(restante).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ padding: 3, gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="inherit"
                    startIcon={<Cancel />}
                    sx={{ minWidth: 120, borderRadius: 2 }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircle />}
                    sx={{ minWidth: 120, borderRadius: 2 }}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
