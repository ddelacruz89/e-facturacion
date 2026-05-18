import React, { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    Snackbar,
    Step,
    StepLabel,
    Stepper,
    Switch,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
    Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { AlphanumericInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import ModalSearch from "../search/ModalSearch";
import SearchButton from "../search/SearchButton";
import useModalSearch from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS, SearchResultItem } from "../../types/modalSearchTypes";
import { getTodosModulos } from "../../apis/ModulosController";
import {
    getRol,
    saveRol,
    updateRol,
    getUsuariosRol,
    addUsuarioRol,
    removeUsuarioRol,
} from "../../apis/RolController";
import { getSucursalesActivas } from "../../apis/SucursalController";
import { ModuloDto, MenuDto, SgRol, SgPermiso, SgUsuarioRol } from "../../models/seguridad";
import { SgSucursal } from "../../models/seguridad/SgSucursal";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type PermisoFlags = {
    puedeLeer: boolean;
    puedeEscribir: boolean;
    puedeEliminar: boolean;
    puedeImprimir: boolean;
};

type PermisoMatrix = Record<number, PermisoFlags>; // keyed by menuId

interface RolForm {
    nombre: string;
    descripcion: string;
    activo: boolean;
}

const PERM_COLS: { key: keyof PermisoFlags; label: string }[] = [
    { key: "puedeLeer",     label: "Leer" },
    { key: "puedeEscribir", label: "Escribir" },
    { key: "puedeEliminar", label: "Eliminar" },
    { key: "puedeImprimir", label: "Imprimir" },
];

const emptyFlags = (): PermisoFlags => ({
    puedeLeer: false,
    puedeEscribir: false,
    puedeEliminar: false,
    puedeImprimir: false,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDate = (v?: string) =>
    v ? new Date(v).toLocaleDateString("es-DO") : "";

const allTrue = (flags: PermisoFlags) =>
    flags.puedeLeer && flags.puedeEscribir && flags.puedeEliminar && flags.puedeImprimir;

const anyTrue = (flags: PermisoFlags) =>
    flags.puedeLeer || flags.puedeEscribir || flags.puedeEliminar || flags.puedeImprimir;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
const RolView: React.FC = () => {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<RolForm>({ defaultValues: { nombre: "", descripcion: "", activo: true } });

    const [selectedRol, setSelectedRol] = useState<SgRol | null>(null);
    const [modulos, setModulos] = useState<ModuloDto[]>([]);
    const [matrix, setMatrix] = useState<PermisoMatrix>({});
    const [usuariosRol, setUsuariosRol] = useState<SgUsuarioRol[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "info" });

    // Wizard de asignación de usuario
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignStep, setAssignStep] = useState(0); // 0 = usuario, 1 = sucursales
    const [pendingUser, setPendingUser] = useState<{ username: string; nombre: string } | null>(null);
    const [checkedSucursales, setCheckedSucursales] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    const rolSearch     = useModalSearch();
    const usuarioSearch = useModalSearch();

    const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info") =>
        setSnackbar({ open: true, message, severity });

    // Cargar módulos y sucursales al montar
    useEffect(() => {
        getTodosModulos()
            .then(setModulos)
            .catch(() => showSnackbar("Error al cargar módulos", "error"));
        getSucursalesActivas()
            .then(setSucursales)
            .catch(() => showSnackbar("Error al cargar sucursales", "error"));
    }, []);

    // -----------------------------------------------------------------------
    // Clear
    // -----------------------------------------------------------------------
    const clearForm = () => {
        setSelectedRol(null);
        reset({ nombre: "", descripcion: "", activo: true });
        setMatrix({});
        setUsuariosRol([]);
        setActiveTab(0);
    };

    // -----------------------------------------------------------------------
    // Cargar rol existente
    // -----------------------------------------------------------------------
    const handleRolSelect = rolSearch.handleSelect(async (resumen: any) => {
        try {
            const rol = await getRol(resumen.id);
            setSelectedRol(rol);
            reset({ nombre: rol.nombre, descripcion: rol.descripcion ?? "", activo: rol.activo });

            // Poblar la matriz de permisos
            const m: PermisoMatrix = {};
            for (const p of rol.permisos ?? []) {
                const menuId = typeof p.menu === "object" ? (p.menu as any).id : p.menu;
                if (menuId) {
                    m[menuId] = {
                        puedeLeer:     !!p.puedeLeer,
                        puedeEscribir: !!p.puedeEscribir,
                        puedeEliminar: !!p.puedeEliminar,
                        puedeImprimir: !!p.puedeImprimir,
                    };
                }
            }
            setMatrix(m);

            // Cargar usuarios asignados
            const usuarios = await getUsuariosRol(rol.id!);
            setUsuariosRol(usuarios);

            showSnackbar("Rol cargado", "success");
        } catch {
            showSnackbar("Error al cargar el rol", "error");
        }
    });

    // -----------------------------------------------------------------------
    // Matriz: helpers
    // -----------------------------------------------------------------------
    const setFlag = useCallback(
        (menuId: number, key: keyof PermisoFlags, value: boolean) =>
            setMatrix((prev) => ({
                ...prev,
                [menuId]: { ...(prev[menuId] ?? emptyFlags()), [key]: value },
            })),
        []
    );

    // Seleccionar/deseleccionar todos los permisos de una fila
    const toggleRow = (menuId: number, checked: boolean) =>
        setMatrix((prev) => ({
            ...prev,
            [menuId]: { puedeLeer: checked, puedeEscribir: checked, puedeEliminar: checked, puedeImprimir: checked },
        }));

    // Seleccionar/deseleccionar una columna en todos los menús de un módulo
    const toggleModuloCol = (menus: MenuDto[], key: keyof PermisoFlags, checked: boolean) =>
        setMatrix((prev) => {
            const next = { ...prev };
            menus.forEach((m) => {
                next[m.id] = { ...(next[m.id] ?? emptyFlags()), [key]: checked };
            });
            return next;
        });

    // Seleccionar/deseleccionar todos los permisos de todos los menús de un módulo
    const toggleModuloAll = (menus: MenuDto[], checked: boolean) =>
        setMatrix((prev) => {
            const next = { ...prev };
            menus.forEach((m) => {
                next[m.id] = { puedeLeer: checked, puedeEscribir: checked, puedeEliminar: checked, puedeImprimir: checked };
            });
            return next;
        });

    // Seleccionar/deseleccionar una columna globalmente
    const toggleGlobalCol = (key: keyof PermisoFlags, checked: boolean) =>
        setMatrix((prev) => {
            const next = { ...prev };
            modulos.forEach((mod) =>
                (mod.menus ?? []).forEach((m) => {
                    next[m.id] = { ...(next[m.id] ?? emptyFlags()), [key]: checked };
                })
            );
            return next;
        });

    // -----------------------------------------------------------------------
    // Submit
    // -----------------------------------------------------------------------
    const onSubmit: SubmitHandler<RolForm> = async (data) => {
        if (!data.nombre.trim()) {
            showSnackbar("El nombre del rol es requerido", "error");
            return;
        }

        // Convertir matriz a lista de permisos (sólo los que tienen al menos un flag)
        const permisos: SgPermiso[] = Object.entries(matrix)
            .filter(([, flags]) => anyTrue(flags))
            .map(([menuId, flags]) => ({
                menu: { id: Number(menuId) },
                puedeLeer:     flags.puedeLeer,
                puedeEscribir: flags.puedeEscribir,
                puedeEliminar: flags.puedeEliminar,
                puedeImprimir: flags.puedeImprimir,
                activo: true,
            }));

        const payload: SgRol = {
            ...(selectedRol ?? {}),
            nombre:      data.nombre.trim(),
            descripcion: data.descripcion?.trim() || undefined,
            activo:      data.activo,
            permisos,
        };

        try {
            let saved: SgRol;
            if (selectedRol?.id) {
                saved = await updateRol(selectedRol.id, payload);
            } else {
                saved = await saveRol(payload);
            }
            setSelectedRol(saved);
            showSnackbar(selectedRol?.id ? "Rol actualizado" : "Rol creado", "success");
        } catch {
            showSnackbar("Error al guardar el rol", "error");
        }
    };

    // -----------------------------------------------------------------------
    // Wizard de asignación usuario → sucursales
    // -----------------------------------------------------------------------

    const closeAssignWizard = () => {
        setAssignOpen(false);
        setAssignStep(0);
        setPendingUser(null);
        setCheckedSucursales(new Set());
    };

    // Paso 1: usuario seleccionado en el modal
    const handleUsuarioSelect = usuarioSearch.handleSelect(async (resumen: SearchResultItem) => {
        if (!selectedRol?.id) {
            showSnackbar("Guarda el rol primero antes de asignar usuarios", "warning");
            return;
        }
        const username = (resumen.username ?? resumen.id) as string;
        const nombre = (resumen.nombre ?? username) as string;

        // Pre-marcar sucursales donde el usuario ya tiene este rol
        const yaAsignadas = new Set(
            usuariosRol
                .filter((ur) => ur.usuario?.username === username)
                .map((ur) => ur.sucursalId?.id)
                .filter((id): id is number => id != null)
        );

        setPendingUser({ username, nombre });
        setCheckedSucursales(yaAsignadas);
        setAssignStep(0);
        setAssignOpen(true);
    });

    const toggleSucursal = (id: number) => {
        setCheckedSucursales((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Paso final: confirmar los cambios (agrega nuevas, elimina las desmarcadas)
    const handleConfirmAssign = async () => {
        if (!pendingUser || !selectedRol?.id) return;
        setSaving(true);
        try {
            const existentes = usuariosRol.filter(
                (ur) => ur.usuario?.username === pendingUser.username
            );
            const existenteIds = new Set(
                existentes.map((ur) => ur.sucursalId?.id).filter((id): id is number => id != null)
            );

            // Agregar sucursales nuevamente marcadas
            for (const sucId of Array.from(checkedSucursales)) {
                if (!existenteIds.has(sucId)) {
                    const nueva = await addUsuarioRol(selectedRol.id!, pendingUser.username, sucId);
                    setUsuariosRol((prev) => [...prev, nueva]);
                }
            }

            // Eliminar asignaciones desmarcadas
            for (const ur of existentes) {
                if (ur.sucursalId?.id != null && !checkedSucursales.has(ur.sucursalId.id)) {
                    await removeUsuarioRol(selectedRol.id!, ur.id!);
                    setUsuariosRol((prev) => prev.filter((u) => u.id !== ur.id));
                }
            }

            showSnackbar("Asignación actualizada", "success");
            closeAssignWizard();
        } catch {
            showSnackbar("Error al actualizar asignación", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveUsuario = async (asignacion: SgUsuarioRol) => {
        if (!selectedRol?.id || !asignacion.id) return;
        try {
            await removeUsuarioRol(selectedRol.id, asignacion.id);
            setUsuariosRol((prev) => prev.filter((u) => u.id !== asignacion.id));
            showSnackbar("Usuario removido", "success");
        } catch {
            showSnackbar("Error al remover usuario", "error");
        }
    };

    // -----------------------------------------------------------------------
    // Computed: ¿están todos los menús de un módulo con cierto flag marcados?
    // -----------------------------------------------------------------------
    const moduloColChecked = (menus: MenuDto[], key: keyof PermisoFlags) =>
        menus.length > 0 && menus.every((m) => matrix[m.id]?.[key] === true);

    const moduloAllChecked = (menus: MenuDto[]) =>
        menus.length > 0 && menus.every((m) => allTrue(matrix[m.id] ?? emptyFlags()));

    const globalColChecked = (key: keyof PermisoFlags) =>
        modulos.every((mod) => (mod.menus ?? []).every((m) => matrix[m.id]?.[key] === true));

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <ActionBar title="Roles y Permisos">
                    <Button
                        size="small"
                        sx={{ color: "white", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
                        type="submit">
                        Guardar
                    </Button>
                    <Button
                        size="small"
                        sx={{ color: "white", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
                        type="button"
                        onClick={clearForm}>
                        Nuevo
                    </Button>
                </ActionBar>

                {/* ── Información básica ── */}
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Información del Rol
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                            <Box sx={{ width: 220 }}>
                                <SearchButton
                                    config={SEARCH_CONFIGS.ROL}
                                    onOpenSearch={rolSearch.openModal}
                                    variant="input"
                                    size="small"
                                    label="Buscar Rol"
                                    displayValue={selectedRol?.id ?? ""}
                                    placeholder="Seleccione un rol..."
                                />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                                <AlphanumericInput
                                    label="Nombre del Rol"
                                    size={12}
                                    name="nombre"
                                    control={control}
                                    error={errors.nombre}
                                    rules={{ required: "Campo requerido", minLength: { value: 2, message: "Mínimo 2 caracteres" } }}
                                />
                            </Box>
                            <Box sx={{ flex: 2, minWidth: 260 }}>
                                <AlphanumericInput
                                    label="Descripción"
                                    size={12}
                                    name="descripcion"
                                    control={control}
                                    error={errors.descripcion}
                                />
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={watch("activo")}
                                            onChange={(e) => setValue("activo", e.target.checked)}
                                        />
                                    }
                                    label="Activo"
                                />
                            </Box>
                        </Box>

                        {selectedRol && (
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Chip label={`ID: ${selectedRol.id}`} size="small" />
                                {selectedRol.secuencia && <Chip label={`Seq: ${selectedRol.secuencia}`} size="small" />}
                                {selectedRol.fechaReg && (
                                    <Chip label={`Creado: ${formatDate(selectedRol.fechaReg)}`} size="small" variant="outlined" />
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* ── Tabs: Permisos | Usuarios ── */}
                <Card>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                        <Tab label="Permisos por Módulo" />
                        <Tab label={`Usuarios Asignados (${usuariosRol.length})`} />
                    </Tabs>

                    <CardContent>
                        {/* ════════════════════ TAB 0: Permisos ════════════════════ */}
                        {activeTab === 0 && (
                            <>
                                {modulos.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                                        Cargando módulos…
                                    </Typography>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: "primary.main" }}>
                                                    <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                                                        Menú
                                                    </TableCell>
                                                    {PERM_COLS.map((col) => (
                                                        <TableCell key={col.key} align="center" sx={{ fontWeight: "bold", width: "15%" }}>
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Tooltip title={`Marcar todos — ${col.label}`}>
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={globalColChecked(col.key)}
                                                                        onChange={(e) => toggleGlobalCol(col.key, e.target.checked)}
                                                                        sx={{ p: 0.3 }}
                                                                    />
                                                                </Tooltip>
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {col.label}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {modulos.map((modulo) => {
                                                    const menus = modulo.menus ?? [];
                                                    return (
                                                        <React.Fragment key={modulo.id}>
                                                            {/* Cabecera de módulo */}
                                                            <TableRow sx={{ backgroundColor: "grey.100" }}>
                                                                <TableCell colSpan={5}>
                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                        <Tooltip title="Seleccionar todos los permisos de este módulo">
                                                                            <Checkbox
                                                                                size="small"
                                                                                checked={moduloAllChecked(menus)}
                                                                                indeterminate={
                                                                                    !moduloAllChecked(menus) &&
                                                                                    menus.some((m) => anyTrue(matrix[m.id] ?? emptyFlags()))
                                                                                }
                                                                                onChange={(e) => toggleModuloAll(menus, e.target.checked)}
                                                                            />
                                                                        </Tooltip>
                                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                                                            {modulo.modulo}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={`${menus.filter((m) => anyTrue(matrix[m.id] ?? emptyFlags())).length}/${menus.length}`}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            color="primary"
                                                                        />
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>

                                                            {/* Filas de menús */}
                                                            {menus.map((menu) => {
                                                                const flags = matrix[menu.id] ?? emptyFlags();
                                                                const rowAll = allTrue(flags);
                                                                const rowAny = anyTrue(flags);
                                                                return (
                                                                    <TableRow
                                                                        key={menu.id}
                                                                        hover
                                                                        sx={{
                                                                            backgroundColor: rowAny ? "action.hover" : "inherit",
                                                                        }}>
                                                                        {/* Nombre del menú con checkbox "seleccionar todos" */}
                                                                        <TableCell>
                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 3 }}>
                                                                                <Tooltip title="Seleccionar/deseleccionar todos los permisos de este menú">
                                                                                    <Checkbox
                                                                                        size="small"
                                                                                        checked={rowAll}
                                                                                        indeterminate={rowAny && !rowAll}
                                                                                        onChange={(e) => toggleRow(menu.id, e.target.checked)}
                                                                                    />
                                                                                </Tooltip>
                                                                                <Typography variant="body2">
                                                                                    {menu.menu}
                                                                                </Typography>
                                                                            </Box>
                                                                        </TableCell>

                                                                        {/* Checkboxes por permiso */}
                                                                        {PERM_COLS.map((col) => (
                                                                            <TableCell key={col.key} align="center">
                                                                                <Checkbox
                                                                                    size="small"
                                                                                    checked={!!flags[col.key]}
                                                                                    onChange={(e) => setFlag(menu.id, col.key, e.target.checked)}
                                                                                />
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </>
                        )}

                        {/* ════════════════════ TAB 1: Usuarios ════════════════════ */}
                        {activeTab === 1 && (
                            <>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        Usuarios con este rol en la sucursal actual
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<PersonAddIcon />}
                                        disabled={!selectedRol?.id}
                                        onClick={() => usuarioSearch.openModal(SEARCH_CONFIGS.USUARIO)}>
                                        Agregar Usuario
                                    </Button>
                                </Box>

                                {usuariosRol.length === 0 ? (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            py: 5,
                                            border: "2px dashed",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            color: "text.secondary",
                                        }}>
                                        <Typography variant="body2">
                                            {selectedRol?.id
                                                ? "No hay usuarios asignados a este rol en la sucursal actual."
                                                : "Guarda el rol primero para poder asignar usuarios."}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: "grey.50" }}>
                                                    <TableCell>Usuario</TableCell>
                                                    <TableCell>Nombre</TableCell>
                                                    <TableCell>Sucursal</TableCell>
                                                    <TableCell>Activo</TableCell>
                                                    <TableCell width="60px" />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {usuariosRol.map((ur) => (
                                                    <TableRow key={ur.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {ur.usuario?.username}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>{ur.usuario?.nombre}</TableCell>
                                                        <TableCell>{ur.sucursalId?.nombre}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={ur.activo ? "Activo" : "Inactivo"}
                                                                size="small"
                                                                color={ur.activo ? "success" : "default"}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip title="Remover">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveUsuario(ur)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Modales */}
            {rolSearch.config && (
                <ModalSearch
                    open={rolSearch.isOpen}
                    onClose={rolSearch.closeModal}
                    onSelect={handleRolSelect}
                    config={rolSearch.config}
                    initialValues={rolSearch.initialValues}
                />
            )}
            {usuarioSearch.config && (
                <ModalSearch
                    open={usuarioSearch.isOpen}
                    onClose={usuarioSearch.closeModal}
                    onSelect={handleUsuarioSelect}
                    config={usuarioSearch.config}
                    initialValues={usuarioSearch.initialValues}
                />
            )}

            {/* Wizard: asignar usuario a sucursales */}
            <Dialog open={assignOpen} onClose={closeAssignWizard} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Asignar usuario al rol
                </DialogTitle>
                <DialogContent dividers>
                    <Stepper activeStep={assignStep} sx={{ mb: 3 }}>
                        <Step><StepLabel>Usuario</StepLabel></Step>
                        <Step><StepLabel>Sucursales</StepLabel></Step>
                    </Stepper>

                    {assignStep === 0 && pendingUser && (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            <Typography variant="h6">{pendingUser.nombre}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{pendingUser.username}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                                En el siguiente paso podrás elegir las sucursales donde este
                                usuario tendrá acceso con el rol <strong>{selectedRol?.nombre}</strong>.
                            </Typography>
                        </Box>
                    )}

                    {assignStep === 1 && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Selecciona las sucursales. Las que ya estaban asignadas
                                aparecen marcadas.
                            </Typography>
                            <List disablePadding>
                                {sucursales.map((s) => (
                                    <ListItem key={s.id} disablePadding>
                                        <FormControlLabel
                                            sx={{ width: "100%", px: 1, py: 0.5 }}
                                            control={
                                                <Checkbox
                                                    checked={checkedSucursales.has(s.id!)}
                                                    onChange={() => toggleSucursal(s.id!)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body1">{s.nombre}</Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAssignWizard} disabled={saving}>
                        Cancelar
                    </Button>
                    {assignStep === 0 ? (
                        <Button
                            variant="contained"
                            onClick={() => setAssignStep(1)}>
                            Siguiente →
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => setAssignStep(0)} disabled={saving}>
                                ← Atrás
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleConfirmAssign}
                                disabled={saving}>
                                {saving ? "Guardando…" : "Confirmar"}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default RolView;
