import React, { useState } from "react";
import { useForm, useFieldArray, SubmitHandler, Controller } from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Paper,
    FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ActionBar from "../../customers/ActionBar";
import { ModalSearch } from "../search/ModalSearch";
import { SEARCH_CONFIGS, SearchResultItem } from "../../types/modalSearchTypes";
import {
    buscarConfig,
    getConfig,
    saveConfig,
    updateConfig,
    desactivarConfig,
} from "../../apis/AprobacionController";
import {
    SgConfigAprobacion,
    SgConfigAprobacionNivel,
    SgConfigAprobacionResumenDTO,
    MODOS_APROBACION,
    TIPOS_DOCUMENTO,
} from "../../models/seguridad/SgAprobacion";

// ── Valores iniciales ─────────────────────────────────────────────────────────

const defaultNivel = (): SgConfigAprobacionNivel => ({
    nivel: 1,
    usaManager: false,
    aprobador: null,
});

const defaultConfig: SgConfigAprobacion = {
    tipoDocumento: "",
    nombre: "",
    modoAprobacion: "SECUENCIAL",
    activo: true,
    niveles: [defaultNivel()],
};

// ── Componente ────────────────────────────────────────────────────────────────

const AprobacionConfigView = () => {
    const [isNew, setIsNew] = useState(true);
    const [configs, setConfigs] = useState<SgConfigAprobacionResumenDTO[]>([]);
    const [cargando, setCargando] = useState(false);
    const [aprobadorModalIdx, setAprobadorModalIdx] = useState<number | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
        open: false, msg: "", severity: "success",
    });
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<SgConfigAprobacion>({
        defaultValues: defaultConfig,
    });

    const { fields: nivelesFields, append, remove } = useFieldArray({ control, name: "niveles" });

    const selectedId = watch("id");
    const modoActual = watch("modoAprobacion");

    // ── Cargar lista ──────────────────────────────────────────────────────────
    const cargarLista = async () => {
        setCargando(true);
        try {
            const data = await buscarConfig({ activo: undefined });
            setConfigs(data);
        } catch { /* no-op */ }
        finally { setCargando(false); }
    };

    React.useEffect(() => { cargarLista(); }, []);

    // ── Seleccionar config para editar ────────────────────────────────────────
    const handleSeleccionar = async (id: number) => {
        try {
            const completo = await getConfig(id);
            reset(completo);
            setIsNew(false);
        } catch {
            mostrarSnack("Error al cargar la configuración", "error");
        }
    };

    // ── Seleccionar aprobador desde modal ─────────────────────────────────────
    const handleSelectAprobador = (resumen: SearchResultItem) => {
        if (aprobadorModalIdx === null) return;
        // Actualizamos usando el control de react-hook-form
        const niveles = watch("niveles");
        niveles[aprobadorModalIdx].aprobador = {
            username: resumen.username as string,
            nombre: resumen.nombre as string,
        };
        reset({ ...watch(), niveles });
        setAprobadorModalIdx(null);
    };

    // ── Guardar ───────────────────────────────────────────────────────────────
    const onSubmit: SubmitHandler<SgConfigAprobacion> = async (data) => {
        try {
            // Renumerar niveles según su posición en el array
            const payload: SgConfigAprobacion = {
                ...data,
                niveles: data.niveles.map((n, i) => ({
                    ...n,
                    nivel: i + 1,
                    aprobador: n.usaManager ? null : (n.aprobador ?? null),
                })),
            };
            const saved = isNew
                ? await saveConfig(payload)
                : await updateConfig(data.id!, payload);
            reset(saved);
            setIsNew(false);
            mostrarSnack("Configuración guardada correctamente", "success");
            cargarLista();
        } catch {
            mostrarSnack("Error al guardar la configuración", "error");
        }
    };

    const handleNuevo = () => { reset(defaultConfig); setIsNew(true); };

    const handleDesactivar = async () => {
        if (confirmDelete === null) return;
        try {
            await desactivarConfig(confirmDelete);
            mostrarSnack("Configuración desactivada", "success");
            reset(defaultConfig);
            setIsNew(true);
            cargarLista();
        } catch {
            mostrarSnack("Error al desactivar", "error");
        } finally { setConfirmDelete(null); }
    };

    const mostrarSnack = (msg: string, severity: "success" | "error") =>
        setSnack({ open: true, msg, severity });

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Configuración de Aprobaciones">
                    <Button size="small" variant="contained" onClick={handleNuevo}
                        sx={{ bgcolor: "#716752", "&:hover": { bgcolor: "#5a5241" } }}>
                        Nuevo
                    </Button>
                    <Button size="small" variant="contained" type="submit"
                        sx={{ bgcolor: "#527158", "&:hover": { bgcolor: "#3d5542" } }}>
                        Guardar
                    </Button>
                    {!isNew && selectedId && (
                        <Button size="small" variant="contained"
                            onClick={() => setConfirmDelete(selectedId)}
                            sx={{ bgcolor: "#71526B", "&:hover": { bgcolor: "#5a3f55" } }}>
                            Desactivar
                        </Button>
                    )}
                </ActionBar>

                {selectedId && (
                    <Box sx={{ px: 2, pb: 1 }}>
                        <Chip label={isNew ? "Nueva configuración" : `Editando: #${selectedId}`}
                            color={isNew ? "default" : "primary"} size="small" />
                    </Box>
                )}

                {/* ── Campos principales ── */}
                <section>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        <Grid size={{ xs: 12, sm: 5 }}>
                            <Controller name="nombre" control={control}
                                rules={{ required: "Campo requerido" }}
                                render={({ field }) => (
                                    <TextField {...field} label="Nombre de la configuración" size="small"
                                        fullWidth error={!!errors.nombre} helperText={errors.nombre?.message} />
                                )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name="tipoDocumento" control={control}
                                rules={{ required: "Campo requerido" }}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" error={!!errors.tipoDocumento}>
                                        <InputLabel>Tipo de Documento</InputLabel>
                                        <Select {...field} label="Tipo de Documento">
                                            {TIPOS_DOCUMENTO.map((t) => (
                                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name="modoAprobacion" control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Modo de aprobación</InputLabel>
                                        <Select {...field} label="Modo de aprobación">
                                            {MODOS_APROBACION.map((m) => (
                                                <MenuItem key={m.value} value={m.value}>
                                                    <Box>
                                                        <Typography variant="body2">{m.label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {m.descripcion}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }} sx={{ display: "flex", alignItems: "center" }}>
                            <Controller name="activo" control={control}
                                render={({ field }) => (
                                    <FormControlLabel label="Activo"
                                        control={<Switch checked={field.value ?? true}
                                            onChange={(e) => field.onChange(e.target.checked)} />} />
                                )} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ mx: 2 }} />

                    {/* ── Niveles / Aprobadores ── */}
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle2">
                                Aprobadores
                                {modoActual === "SECUENCIAL" && (
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        (el orden en la tabla define la secuencia)
                                    </Typography>
                                )}
                            </Typography>
                            <Button size="small" startIcon={<AddIcon />}
                                onClick={() => append({ ...defaultNivel(), nivel: nivelesFields.length + 1 })}>
                                Agregar aprobador
                            </Button>
                        </Box>

                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ "& th": { bgcolor: "#3D4453", color: "#fff", fontWeight: 600 } }}>
                                    <TableRow>
                                        <TableCell width="8%">Nivel</TableCell>
                                        <TableCell width="25%">Aprobador</TableCell>
                                        <TableCell width="22%">Tipo</TableCell>
                                        <TableCell width="35%">Usuario seleccionado</TableCell>
                                        <TableCell width="10%" align="center">Quitar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {nivelesFields.map((field, idx) => {
                                        const usaManager = watch(`niveles.${idx}.usaManager`);
                                        const aprobadorActual = watch(`niveles.${idx}.aprobador`);
                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{idx + 1}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Controller
                                                        name={`niveles.${idx}.usaManager`}
                                                        control={control}
                                                        render={({ field: f }) => (
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={f.value ? "manager" : "fijo"}
                                                                    onChange={(e) => {
                                                                        f.onChange(e.target.value === "manager");
                                                                    }}>
                                                                    <MenuItem value="manager">Manager del solicitante</MenuItem>
                                                                    <MenuItem value="fijo">Usuario específico</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        )} />
                                                </TableCell>
                                                <TableCell>
                                                    {usaManager ? (
                                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                            Se resuelve en tiempo de ejecución
                                                        </Typography>
                                                    ) : (
                                                        <Button size="small" variant="outlined"
                                                            onClick={() => setAprobadorModalIdx(idx)}>
                                                            {aprobadorActual ? "Cambiar" : "Seleccionar"}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {!usaManager && aprobadorActual && (
                                                        <Typography variant="body2">
                                                            {aprobadorActual.nombre}
                                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                                ({aprobadorActual.username})
                                                            </Typography>
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Quitar nivel">
                                                        <IconButton size="small" color="error"
                                                            onClick={() => remove(idx)}
                                                            disabled={nivelesFields.length === 1}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {nivelesFields.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    Agrega al menos un aprobador
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </section>
            </Box>

            {/* ── Lista de configuraciones ── */}
            <Box sx={{ px: 2, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Configuraciones existentes
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead sx={{ "& th": { bgcolor: "#525C71", color: "#fff", fontWeight: 600 } }}>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Tipo documento</TableCell>
                                <TableCell>Modo</TableCell>
                                <TableCell align="center">Aprobadores</TableCell>
                                <TableCell align="center">Estado</TableCell>
                                <TableCell align="center">Editar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow><TableCell colSpan={6} align="center">Cargando…</TableCell></TableRow>
                            ) : configs.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">Sin configuraciones</TableCell></TableRow>
                            ) : configs.map((c) => (
                                <TableRow key={c.id} hover>
                                    <TableCell>{c.nombre}</TableCell>
                                    <TableCell>{c.tipoDocumento}</TableCell>
                                    <TableCell>{c.modoAprobacion}</TableCell>
                                    <TableCell align="center">{c.cantidadNiveles}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={c.activo ? "Activo" : "Inactivo"}
                                            color={c.activo ? "success" : "default"} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => handleSeleccionar(c.id)}>Editar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Modal búsqueda de aprobador */}
            <ModalSearch
                open={aprobadorModalIdx !== null}
                onClose={() => setAprobadorModalIdx(null)}
                onSelect={handleSelectAprobador}
                config={SEARCH_CONFIGS.USUARIO}
            />

            {/* Confirm desactivar */}
            <Dialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
                <DialogTitle>Desactivar configuración</DialogTitle>
                <DialogContent>
                    <Typography>¿Seguro que quieres desactivar esta configuración? Los documentos nuevos no podrán usar este flujo de aprobación.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setConfirmDelete(null)}
                        sx={{ bgcolor: "#5F5271", "&:hover": { bgcolor: "#4a3f5a" } }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleDesactivar}
                        sx={{ bgcolor: "#71526B", "&:hover": { bgcolor: "#5a3f55" } }}>
                        Desactivar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default AprobacionConfigView;
