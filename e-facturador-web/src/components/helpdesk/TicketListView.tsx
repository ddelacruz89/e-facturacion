import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TableComponent } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { listarTickets, getEstados } from "../../apis/HelpdeskController";
import { HdEstado, HdTicketResumen } from "../../models/helpdesk";
import { formatDateTimeShort } from "../../types/modalSearchTypes";
import { toast } from "react-toastify";
import TicketNuevoDialog from "./TicketNuevoDialog";

const ESTADO_COLORES: Record<string, "default" | "warning" | "info" | "primary" | "success" | "error"> = {
    PEND_ASIG: "warning",
    ASIG: "info",
    PROC: "primary",
    ESP: "default",
    COMP: "success",
    CANC: "error",
};

const TicketListView = () => {
    const navigate = useNavigate();

    const [tickets, setTickets]     = useState<HdTicketResumen[]>([]);
    const [estados, setEstados]     = useState<HdEstado[]>([]);
    const [q, setQ]                 = useState("");
    const [estadoId, setEstadoId]   = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage]           = useState(0);
    const [abrirNuevo, setAbrirNuevo] = useState(false);

    useEffect(() => {
        getEstados().then(setEstados).catch(() => {});
    }, []);

    useEffect(() => {
        cargar();
    }, [page, estadoId]);

    const cargar = () => {
        listarTickets(q, estadoId || undefined, page, 50)
            .then((res) => {
                setTickets(res.content);
                setTotalPages(res.totalPages);
            })
            .catch(() => toast.error("Error cargando tickets"));
    };

    const columnas = [
        { id: "id",             label: "#" },
        { id: "titulo",         label: "Título" },
        {
            id: "estadoNombre",
            label: "Estado",
            render: (row: HdTicketResumen) => (
                <Chip
                    label={row.estadoNombre}
                    color={ESTADO_COLORES[row.estadoId] ?? "default"}
                    size="small"
                />
            ),
        },
        {
            id: "prioridadNombre",
            label: "Prioridad",
            render: (row: HdTicketResumen) => (
                <Chip
                    label={row.prioridadNombre}
                    variant="outlined"
                    size="small"
                    color={
                        row.prioridadId === "CRITICA" ? "error" :
                        row.prioridadId === "ALTA"    ? "warning" :
                        row.prioridadId === "MEDIA"   ? "default" : "default"
                    }
                />
            ),
        },
        { id: "fechaReg", label: "Creado", render: (r: HdTicketResumen) => formatDateTimeShort(r.fechaReg) },
    ];

    return (
        <main>
            <ActionBar title="Mis Tickets de Soporte">
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAbrirNuevo(true)}
                >
                    Nuevo Ticket
                </Button>
            </ActionBar>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Buscar por título"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && cargar()}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={estadoId}
                                label="Estado"
                                onChange={(e) => { setEstadoId(e.target.value); setPage(0); }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {estados.map((e) => (
                                    <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Button variant="outlined" fullWidth onClick={() => { setPage(0); cargar(); }}>
                            Buscar
                        </Button>
                    </Grid>
                </Grid>

                <TableComponent
                    selected={(row: HdTicketResumen) => navigate(`/helpdesk/tickets/${row.id}`)}
                    rows={tickets}
                    columns={columnas}
                />

                {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" gap={1} mt={2}>
                        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                        <Typography alignSelf="center">Página {page + 1} de {totalPages}</Typography>
                        <Button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button>
                    </Box>
                )}
            </Box>

            <TicketNuevoDialog
                open={abrirNuevo}
                onClose={() => setAbrirNuevo(false)}
                onCreado={(ticket) => {
                    setAbrirNuevo(false);
                    navigate(`/helpdesk/tickets/${ticket.id}`);
                }}
            />
        </main>
    );
};

export default TicketListView;
