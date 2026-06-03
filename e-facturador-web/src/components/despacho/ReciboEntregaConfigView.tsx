import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ActionBar from "../../customers/ActionBar";
import {
    EmpresaFeatureConfigDTO,
    FEATURE_RECIBO_ENTREGA,
    StorageTipo,
} from "../../models/seguridad/FeaturePlanModels";
import { getEmpresaFeatureConfig, saveEmpresaFeatureConfig } from "../../apis/FeaturePlanController";

const STORAGE_LABELS: Record<StorageTipo, string> = {
    AWS_S3: "Amazon S3",
    AZURE_BLOB: "Azure Blob Storage",
    LOCAL: "Almacenamiento Local (servidor)",
};

export const ReciboEntregaConfigView: React.FC = () => {
    const [config, setConfig] = useState<EmpresaFeatureConfigDTO>({
        activo: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        msg: string;
        severity: "success" | "error";
    }>({ open: false, msg: "", severity: "success" });

    // Credenciales en texto plano (el usuario las ingresa; enmascaradas en GET)
    const [s3AccessKey, setS3AccessKey] = useState("");
    const [s3SecretKey, setS3SecretKey] = useState("");
    const [s3Bucket, setS3Bucket] = useState("");
    const [s3Region, setS3Region] = useState("");
    const [azureConnStr, setAzureConnStr] = useState("");
    const [azureContainer, setAzureContainer] = useState("");

    const showMsg = (msg: string, severity: "success" | "error" = "success") =>
        setSnackbar({ open: true, msg, severity });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getEmpresaFeatureConfig(FEATURE_RECIBO_ENTREGA);
            setConfig(data);
            // Pre-fill non-sensitive fields from masked config
            const cfg = data.storageConfig as Record<string, string> | undefined;
            if (cfg) {
                setS3Bucket(cfg.bucketName ?? "");
                setS3Region(cfg.region ?? "");
                setS3AccessKey(cfg.accessKeyId ?? "");
                setAzureContainer(cfg.containerName ?? "");
            }
        } catch {
            showMsg("Error al cargar la configuración.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const buildStorageConfigJson = (): string => {
        if (!config.storageTipo) return "";
        switch (config.storageTipo) {
            case "AWS_S3":
                return JSON.stringify({
                    bucketName: s3Bucket,
                    region: s3Region,
                    accessKeyId: s3AccessKey,
                    ...(s3SecretKey && s3SecretKey !== "***" ? { secretAccessKey: s3SecretKey } : {}),
                    pathPrefix: "recibos/",
                });
            case "AZURE_BLOB":
                return JSON.stringify({
                    ...(azureConnStr && azureConnStr !== "***" ? { connectionString: azureConnStr } : {}),
                    containerName: azureContainer,
                });
            case "LOCAL":
                return "{}";
            default:
                return "";
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const storageConfigJson = buildStorageConfigJson();
            await saveEmpresaFeatureConfig(FEATURE_RECIBO_ENTREGA, {
                activo: config.activo,
                storageTipo: config.storageTipo,
                storageConfig: storageConfigJson || undefined,
            });
            showMsg("Configuración guardada exitosamente.");
            await load();
        } catch (e: any) {
            showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <Box sx={{ flexGrow: 1 }}>
                <ActionBar title="Recibo de Entrega — Configuración" />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Box>
        );

    const noDisponible = !config.habilitadoComercialmente;

    return (
        <Box sx={{ flexGrow: 1 }}>
            <ActionBar title="Recibo de Entrega — Configuración" />

            <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 680 }}>
                {noDisponible && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Esta funcionalidad no está incluida en tu plan actual. Contacta a soporte para
                        habilitarla.
                    </Alert>
                )}

                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Recibo de Entrega
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Permite al conductor tomar una foto como prueba de entrega al marcar una orden como
                        "Entregado". La imagen se guarda en el proveedor de almacenamiento configurado.
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.activo}
                                disabled={noDisponible}
                                onChange={(e) => setConfig({ ...config, activo: e.target.checked })}
                                color="success"
                            />
                        }
                        label={config.activo ? "Feature activo" : "Feature inactivo"}
                    />

                    {config.activo && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                                Proveedor de almacenamiento
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                                Elige una sola vez el proveedor donde se guardarán los recibos. Cambiarlo
                                después no migra los archivos existentes.
                            </Typography>

                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel>Proveedor de Storage</InputLabel>
                                <Select
                                    value={config.storageTipo ?? ""}
                                    label="Proveedor de Storage"
                                    onChange={(e) =>
                                        setConfig({ ...config, storageTipo: e.target.value as StorageTipo })
                                    }
                                >
                                    {Object.entries(STORAGE_LABELS).map(([val, label]) => (
                                        <MenuItem key={val} value={val}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* AWS S3 */}
                            {config.storageTipo === "AWS_S3" && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <TextField
                                        label="Bucket Name"
                                        size="small"
                                        fullWidth
                                        value={s3Bucket}
                                        onChange={(e) => setS3Bucket(e.target.value)}
                                    />
                                    <TextField
                                        label="Región (ej. us-east-1)"
                                        size="small"
                                        fullWidth
                                        value={s3Region}
                                        onChange={(e) => setS3Region(e.target.value)}
                                    />
                                    <TextField
                                        label="Access Key ID"
                                        size="small"
                                        fullWidth
                                        value={s3AccessKey}
                                        onChange={(e) => setS3AccessKey(e.target.value)}
                                    />
                                    <TextField
                                        label="Secret Access Key"
                                        size="small"
                                        fullWidth
                                        type="password"
                                        placeholder={
                                            (config.storageConfig as any)?.secretAccessKey === "***"
                                                ? "Configurado (deja en blanco para no cambiar)"
                                                : ""
                                        }
                                        value={s3SecretKey}
                                        onChange={(e) => setS3SecretKey(e.target.value)}
                                    />
                                </Box>
                            )}

                            {/* Azure Blob */}
                            {config.storageTipo === "AZURE_BLOB" && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <TextField
                                        label="Connection String"
                                        size="small"
                                        fullWidth
                                        type="password"
                                        placeholder={
                                            (config.storageConfig as any)?.connectionString === "***"
                                                ? "Configurado (deja en blanco para no cambiar)"
                                                : ""
                                        }
                                        value={azureConnStr}
                                        onChange={(e) => setAzureConnStr(e.target.value)}
                                    />
                                    <TextField
                                        label="Container Name"
                                        size="small"
                                        fullWidth
                                        value={azureContainer}
                                        onChange={(e) => setAzureContainer(e.target.value)}
                                    />
                                </Box>
                            )}

                            {/* LOCAL */}
                            {config.storageTipo === "LOCAL" && (
                                <Alert severity="info">
                                    Los archivos se guardarán en el servidor en la ruta configurada por el
                                    administrador del sistema (variable <code>APP_LOCAL_STORAGE_PATH</code>). No
                                    se requiere configuración adicional.
                                </Alert>
                            )}
                        </>
                    )}

                    <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                            onClick={handleSave}
                            disabled={noDisponible || saving}
                            sx={{ backgroundColor: "#527158", "&:hover": { backgroundColor: "#3c5541" } }}
                        >
                            Guardar configuración
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReciboEntregaConfigView;
