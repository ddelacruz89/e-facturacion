import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import apiClient from "../../services/apiClient";

interface ReciboViewerProps {
    ordenId: number;
    reciboUrl: string;
    clienteNombre: string;
    onClose: () => void;
}

/**
 * Resuelve la URL del recibo a una URL que el browser puede mostrar.
 * - LOCAL (local://…) → llama al endpoint autenticado y crea un blob URL
 * - S3 / Azure → usa la URL pública directamente
 */
export async function resolveReciboUrl(ordenId: number, reciboUrl: string): Promise<string> {
    if (reciboUrl.startsWith("local://")) {
        const response = await apiClient.get(
            `/api/v1/despacho/ordenes/${ordenId}/recibo/file`,
            { responseType: "blob" }
        );
        return URL.createObjectURL(response.data);
    }
    return reciboUrl;
}

/**
 * Visor de recibo a pantalla completa. Soporta los tres tipos de storage.
 * Cierra al tocar el overlay o el botón ✕.
 */
const ReciboViewer: React.FC<ReciboViewerProps> = ({
    ordenId,
    reciboUrl,
    clienteNombre,
    onClose,
}) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let blobUrl: string | null = null;

        resolveReciboUrl(ordenId, reciboUrl)
            .then((url) => {
                if (url.startsWith("blob:")) blobUrl = url;
                setImgSrc(url);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));

        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [ordenId, reciboUrl]);

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.88)",
                zIndex: 1399,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={onClose}
        >
            {/* Header */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.5,
                    backgroundColor: "rgba(0,0,0,0.55)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box>
                    <Typography variant="subtitle2" sx={{ color: "#fff" }}>
                        Recibo de Entrega
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#ccc" }}>
                        {clienteNombre}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: "#fff" }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Imagen */}
            <Box
                sx={{ maxWidth: "90vw", maxHeight: "80vh", mt: 7 }}
                onClick={(e) => e.stopPropagation()}
            >
                {loading && <CircularProgress sx={{ color: "#fff" }} />}
                {error && <Alert severity="error">No se pudo cargar el recibo.</Alert>}
                {imgSrc && !error && (
                    <img
                        src={imgSrc}
                        alt="Recibo de entrega"
                        style={{
                            maxWidth: "90vw",
                            maxHeight: "80vh",
                            objectFit: "contain",
                            borderRadius: 8,
                            display: loading ? "none" : "block",
                        }}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setError(true);
                            setLoading(false);
                        }}
                    />
                )}
            </Box>

            <Typography variant="caption" sx={{ color: "#666", mt: 2 }}>
                Toca fuera para cerrar
            </Typography>
        </Box>
    );
};

export default ReciboViewer;
