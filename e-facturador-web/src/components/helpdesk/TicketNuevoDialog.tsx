import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { crearTicket, getPrioridades } from "../../apis/HelpdeskController";
import { HdPrioridad, HdTicketCreateForm, HdTicketDetalle } from "../../models/helpdesk";
import { ticketSchema } from "../../validations/helpdeskValidation";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreado: (ticket: HdTicketDetalle) => void;
}

const TicketNuevoDialog = ({ open, onClose, onCreado }: Props) => {
    const [prioridades, setPrioridades] = useState<HdPrioridad[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<HdTicketCreateForm>({
        resolver: yupResolver(ticketSchema) as any,
        defaultValues: { titulo: "", descripcion: "", prioridadId: "" },
    });

    useEffect(() => {
        if (open) {
            getPrioridades().then(setPrioridades).catch(() => {});
            reset();
        }
    }, [open]);

    const onSubmit = async (data: HdTicketCreateForm) => {
        try {
            const ticket = await crearTicket(data);
            toast.success("Ticket creado exitosamente");
            onCreado(ticket);
        } catch {
            toast.error("Error al crear el ticket");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Nuevo Ticket de Soporte</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={12}>
                            <TextField
                                {...register("titulo")}
                                label="Título"
                                fullWidth
                                size="small"
                                error={!!errors.titulo}
                                helperText={errors.titulo?.message}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                {...register("descripcion")}
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={4}
                                size="small"
                                error={!!errors.descripcion}
                                helperText={errors.descripcion?.message}
                            />
                        </Grid>
                        <Grid size={6}>
                            <Controller
                                name="prioridadId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" error={!!errors.prioridadId}>
                                        <InputLabel>Prioridad</InputLabel>
                                        <Select {...field} label="Prioridad">
                                            {prioridades.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.prioridadId && (
                                            <FormHelperText>{errors.prioridadId.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        Crear Ticket
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TicketNuevoDialog;
