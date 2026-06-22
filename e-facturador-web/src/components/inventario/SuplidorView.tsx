import React, { useState, useEffect } from "react";
import {
    Button,
    Snackbar,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Box,
    Select,
    MenuItem,
    FormControl,
    FormHelperText,
    InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { TextInput, TextInputPk, EmailInput, ConfirmationModal } from "../../customers/CustomComponents";
import ActionBar from "../../customers/ActionBar";
import { InSuplidor } from "../../models/inventario";
import { getSuplidorById, saveOrUpdateSuplidor } from "../../apis/SuplidorController";
import { getTipoComprobantes } from "../../apis/TipoComprobanteController";
import { TipoComprobanteSelect } from "../../customers/ComboBox";
import { validateSuplidor } from "../../validations/suplidorValidation";
import { ModalSearch } from "../search/ModalSearch";
import { useModalSearch } from "../../hooks/useModalSearch";
import { SEARCH_CONFIGS, SearchConfig } from "../../types/modalSearchTypes";
import { ProductosSuplidorDialog } from "./ProductosSuplidorDialog";

const initialSuplidor: InSuplidor = {
    id: undefined,
    empresaId: undefined,
    secuencia: undefined,
    usuarioReg: "",
    fechaReg: new Date(),
    activo: true,
    nombre: "",
    razonSocial: "",
    tipoIdentificacion: "R",
    rnc: "",
    direccion: "",
    contacto1: "",
    contacto2: "",
    telefono1: "",
    telefono2: "",
    correo1: "",
    correo2: "",
    servicio: false,
    producto: false,
    estadoId: "A",
    tipoComprobante: { id: "", tipoComprobante: "", electronico: false },
};

// ── Helpers de formato de identificación ─────────────────────────────────
/** Cédula dominicana: 000-0000000-0  (11 dígitos) */
const formatCedula = (digits: string): string => {
    const d = digits.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}`;
};

/** RNC dominicano: 0-00-00000-0  (9 dígitos) */
const formatRNC = (digits: string): string => {
    const d = digits.replace(/\D/g, "").slice(0, 9);
    if (d.length <= 1) return d;
    if (d.length <= 3) return `${d.slice(0, 1)}-${d.slice(1)}`;
    if (d.length <= 8) return `${d.slice(0, 1)}-${d.slice(1, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 1)}-${d.slice(1, 3)}-${d.slice(3, 8)}-${d.slice(8)}`;
};

const formatIdentificacion = (rawDigits: string, tipo: string): string =>
    tipo === "C" ? formatCedula(rawDigits) : formatRNC(rawDigits);

export const SuplidorView: React.FC = () => {
    // ── Estado del formulario ────────────────────────────────────────────────
    const [editingSuplidor, setEditingSuplidor] = useState<InSuplidor | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<InSuplidor | null>(null);
    const [selectedTipoComprobante, setSelectedTipoComprobante] = useState<any>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // ── Snackbar ─────────────────────────────────────────────────────────────
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success" | "info" | "warning">("error");

    // ── Tipos de comprobante (ECF) para el dropdown del buscador ─────────────
    const [tiposComprobante, setTiposComprobante] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        getTipoComprobantes()
            .then((tipos) => {
                const opciones = [
                    { value: "", label: "Todos" },
                    ...tipos.map((t) => ({ value: t.id ?? "", label: `${t.id} - ${t.tipoComprobante}` })),
                ];
                setTiposComprobante(opciones);
            })
            .catch(() => setTiposComprobante([{ value: "", label: "Todos" }]));
    }, []);

    /** Config del modal de búsqueda construido dinámicamente con el dropdown de tipos ECF */
    const suplidorSearchConfig: SearchConfig = {
        ...SEARCH_CONFIGS.SUPLIDOR,
        fields: [
            { key: "nombre", label: "Nombre", type: "text" as const, placeholder: "Nombre del suplidor" },
            { key: "rnc", label: "RNC", type: "text" as const, placeholder: "RNC" },
            {
                key: "tipoComprobanteId",
                label: "Tipo ECF",
                type: "select" as const,
                options: tiposComprobante,
            },
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "6%" },
            { key: "nombre", label: "Nombre", width: "28%" },
            { key: "rnc", label: "RNC", width: "16%" },
            { key: "telefono1", label: "Teléfono", width: "15%" },
            { key: "tipoComprobanteDesc", label: "Tipo ECF", width: "25%" },
            {
                key: "activo",
                label: "Estado",
                width: "10%",
                render: (v: any) => (v ? "Activo" : "Inactivo"),
            },
        ],
    };

    // ── Tipo identificación y display del campo formateado ───────────────────
    const [tipoIdent, setTipoIdent] = useState<string>("R");
    const [rncDisplay, setRncDisplay] = useState<string>("");

    // ── Modal de búsqueda de suplidor ─────────────────────────────────────────
    const suplidorSearch = useModalSearch();

    // ── Dialog de productos del suplidor ──────────────────────────────────────
    const [showProductosDialog, setShowProductosDialog] = useState(false);

    // ── React Hook Form ──────────────────────────────────────────────────────
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        resetField,
    } = useForm<InSuplidor>({ defaultValues: initialSuplidor });

    // Errores de validación react-hook-form → snackbar
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            showSnackbar(firstError?.message || "Error de validación", "error");
        }
    }, [errors]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const showSnackbar = (
        msg: string,
        severity: "error" | "success" | "info" | "warning" = "error",
    ) => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // ── Handlers del formulario ───────────────────────────────────────────────
    const onSubmit: SubmitHandler<InSuplidor> = async (data) => {
        const submitData = {
            ...data,
            tipoComprobante: selectedTipoComprobante
                ? { id: selectedTipoComprobante.id }
                : data.tipoComprobante?.id
                  ? { id: data.tipoComprobante.id }
                  : data.tipoComprobante,
        } as InSuplidor;

        const validation = await validateSuplidor({
            ...submitData,
            tipoIdentificacion: tipoIdent,
            tipoComprobante: selectedTipoComprobante || data.tipoComprobante,
        });

        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            showSnackbar(Object.values(validation.errors)[0], "error");
            return;
        }

        setValidationErrors({});
        setPendingData(submitData);
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;
        try {
            await saveOrUpdateSuplidor(pendingData);
            reset(initialSuplidor);
            resetField("secuencia");
            setEditingSuplidor(null);
            setPendingData(null);
            setShowConfirmModal(false);
            setTipoIdent("R");
            setRncDisplay("");
            showSnackbar("Suplidor guardado exitosamente", "success");
        } catch {
            showSnackbar("Error al guardar el suplidor", "error");
        }
    };

    const handleCancelSave = () => {
        setPendingData(null);
        setShowConfirmModal(false);
    };

    const handleOnSelect = (suplidor: InSuplidor) => {
        setEditingSuplidor(suplidor);
        setSelectedTipoComprobante(suplidor.tipoComprobante);
        Object.entries(suplidor).forEach(([key, value]) => {
            setValue(key as keyof InSuplidor, value);
        });
        // Sincronizar tipo y display de identificación
        const tipo = suplidor.tipoIdentificacion || "R";
        setTipoIdent(tipo);
        setRncDisplay(formatIdentificacion(suplidor.rnc || "", tipo));
    };

    const handleClean = () => {
        reset(initialSuplidor);
        resetField("secuencia");
        setEditingSuplidor(null);
        setSelectedTipoComprobante(null);
        setTipoIdent("R");
        setRncDisplay("");
    };

    /** Cambia el tipo de identificación y reformatea el valor actual */
    const handleTipoIdentChange = (nuevoTipo: string) => {
        setTipoIdent(nuevoTipo);
        setValue("tipoIdentificacion", nuevoTipo);
        // Re-formatear dígitos actuales con el nuevo tipo
        const rawDigits = rncDisplay.replace(/\D/g, "");
        setRncDisplay(formatIdentificacion(rawDigits, nuevoTipo));
    };

    /** Maneja el cambio en el input de identificación: guarda dígitos raw en el form,
     *  muestra el valor formateado al usuario */
    const handleRncInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const formatted = formatIdentificacion(raw, tipoIdent);
        setRncDisplay(formatted);
        setValue("rnc", raw); // guardar sin formato en el modelo
    };

    // ── Selección desde el modal de búsqueda ──────────────────────────────────
    const handleSuplidorSelect = suplidorSearch.handleSelect(async (resumen: any) => {
        try {
            const completo = await getSuplidorById(resumen.id);
            handleOnSelect(completo);
        } catch {
            showSnackbar("Error al cargar el suplidor seleccionado", "error");
        }
    });

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ActionBar title="Suplidores">
                <Button variant="contained" color="primary" type="submit">
                    Guardar
                </Button>
                <Button variant="contained" color="primary" onClick={handleClean}>
                    Nuevo
                </Button>
            </ActionBar>

            {/* ── Fila de búsqueda inline ──────────────────────────────────── */}
            <Box display="flex" alignItems="center" gap={2} sx={{ px: 2.5, pt: 2.5 }}>
                {/* Input que muestra el suplidor seleccionado + botón buscar */}
                <Box sx={{ width: 320 }}>
                    <TextField
                        label="Buscar Suplidor"
                        value={editingSuplidor?.nombre ?? ""}
                        size="small"
                        fullWidth
                        placeholder="Haga clic en 🔍 para buscar"
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title="Buscar suplidor">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() =>
                                                suplidorSearch.openModal(suplidorSearchConfig)
                                            }>
                                            <SearchIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Botón Productos (solo cuando hay suplidor activo) */}
                {editingSuplidor?.id && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<InventoryIcon />}
                        size="small"
                        onClick={() => setShowProductosDialog(true)}>
                        Productos
                    </Button>
                )}
            </Box>

            {/* ── Campos del suplidor ──────────────────────────────────────── */}
            <Grid container spacing={2} style={{ padding: 20 }}>
                <TextInputPk
                    control={control}
                    name="secuencia"
                    label="Codigo"
                    error={errors.secuencia}
                    size={1}
                />
                <TextInput
                    control={control}
                    name="nombre"
                    label="Nombre"
                    error={errors.nombre}
                    size={3}
                />
                <Controller
                    name="razonSocial"
                    control={control}
                    rules={{ required: "La razón social es requerida" }}
                    render={({ field }) => (
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControl fullWidth error={!!errors.razonSocial}>
                                <TextField
                                    {...field}
                                    size="small"
                                    fullWidth
                                    label="Razón Social"
                                    variant="outlined"
                                    error={!!errors.razonSocial}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="Si el nombre y la razón social son las mismas, colóquelo."
                                                        placement="top"
                                                        arrow>
                                                        <InfoOutlinedIcon sx={{ fontSize: 16, color: "info.main", cursor: "help" }} />
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                {errors.razonSocial && <FormHelperText>{errors.razonSocial.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    )}
                />
                {/* Tipo de identificación + campo formateado (Cédula o RNC) */}
                {selectedTipoComprobante?.id !== "43" && (
                    <>
                        {/* Select: Cédula / RNC */}
                        <Grid size={{ xs: 12, sm: 1.5 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo ID</InputLabel>
                                <Select
                                    value={tipoIdent}
                                    label="Tipo ID"
                                    onChange={(e) => handleTipoIdentChange(e.target.value as string)}>
                                    <MenuItem value="R">RNC</MenuItem>
                                    <MenuItem value="C">Cédula</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Input formateado — muestra máscara, guarda dígitos raw */}
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <TextField
                                label={tipoIdent === "C" ? "Cédula" : "RNC"}
                                value={rncDisplay}
                                onChange={handleRncInputChange}
                                size="small"
                                fullWidth
                                inputProps={{
                                    maxLength: tipoIdent === "C" ? 13 : 11, // con guiones
                                    placeholder: tipoIdent === "C" ? "000-0000000-0" : "0-00-00000-0",
                                }}
                                error={!!errors.rnc}
                                helperText={errors.rnc?.message}
                            />
                        </Grid>
                    </>
                )}
                <TipoComprobanteSelect
                    control={control}
                    name="tipoComprobante.id"
                    label="Tipo Comprobante"
                    error={errors.tipoComprobante?.id}
                    size={3}
                    handleGetItem={(selected) => setSelectedTipoComprobante(selected)}
                />
                {selectedTipoComprobante?.id !== "43" && (
                    <TextInput
                        control={control}
                        name="direccion"
                        label="Dirección"
                        error={errors.direccion}
                        size={3}
                    />
                )}
            </Grid>

            {selectedTipoComprobante?.id !== "43" && (
                <>
                    <Grid container spacing={2} style={{ padding: 20 }}>
                        <TextInput
                            control={control}
                            name="contacto1"
                            label="Contacto Principal"
                            error={errors.contacto1}
                            size={4}
                        />
                        <EmailInput
                            control={control}
                            name="correo1"
                            label="Correo Principal"
                            error={errors.correo1}
                            size={4}
                        />
                        <TextInput
                            control={control}
                            name="telefono1"
                            label="Teléfono Principal"
                            error={errors.telefono1}
                            size={4}
                        />
                    </Grid>

                    <Grid container spacing={2} style={{ padding: 20 }}>
                        <TextInput
                            control={control}
                            name="contacto2"
                            label="Contacto Secundario"
                            error={errors.contacto2}
                            size={4}
                        />
                        <EmailInput
                            control={control}
                            name="correo2"
                            label="Correo Secundario"
                            error={errors.correo2}
                            size={4}
                        />
                        <TextInput
                            control={control}
                            name="telefono2"
                            label="Teléfono Secundario"
                            error={errors.telefono2}
                            size={4}
                        />
                    </Grid>
                </>
            )}

            {/* ── Modales ───────────────────────────────────────────────────── */}

            {/* Búsqueda de suplidor */}
            {suplidorSearch.isOpen && (
                <ModalSearch
                    open={suplidorSearch.isOpen}
                    onClose={suplidorSearch.closeModal}
                    onSelect={handleSuplidorSelect}
                    config={suplidorSearchConfig}
                    initialValues={suplidorSearch.initialValues}
                />
            )}

            {/* Gestión de productos */}
            {editingSuplidor?.id && (
                <ProductosSuplidorDialog
                    open={showProductosDialog}
                    onClose={() => setShowProductosDialog(false)}
                    suplidorId={editingSuplidor.id}
                    suplidorNombre={editingSuplidor.nombre ?? ""}
                />
            )}

            {/* Confirmación de guardado */}
            <ConfirmationModal
                open={showConfirmModal}
                title="Confirmar Guardado"
                message={`¿Está seguro de que desea ${editingSuplidor ? "actualizar" : "guardar"} este suplidor?`}
                confirmText="Aceptar"
                cancelText="No Aceptar"
                confirmColor="primary"
                onConfirm={handleConfirmSave}
                onCancel={handleCancelSave}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </form>
    );
};

export default SuplidorView;
