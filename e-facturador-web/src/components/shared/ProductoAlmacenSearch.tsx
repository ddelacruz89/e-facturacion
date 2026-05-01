import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    CircularProgress,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import apiClient from "../../services/apiClient";

// ── types ─────────────────────────────────────────────────────────────────────

export interface ProductoResumen {
    id: number;
    nombreProducto: string;
}

interface Props {
    /** ID del almacén. Cuando cambia, limpia la selección actual. */
    almacenId: number | null | undefined;
    /** Producto actualmente seleccionado. */
    value?: ProductoResumen | null;
    /** Se llama con el producto elegido (o null si se borra el texto). */
    onChange: (producto: ProductoResumen | null) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    size?: "small" | "medium";
    fullWidth?: boolean;
    /** Texto de error externo (p.ej. validación del form). */
    error?: boolean;
    helperText?: string;
}

// ── component ─────────────────────────────────────────────────────────────────

const ProductoAlmacenSearch: React.FC<Props> = ({
    almacenId,
    value,
    onChange,
    label = "Producto",
    placeholder = "Buscar por nombre…",
    disabled = false,
    required = false,
    size = "small",
    fullWidth = true,
    error = false,
    helperText,
}) => {
    const [inputText, setInputText] = useState(value?.nombreProducto ?? "");
    const [results, setResults] = useState<ProductoResumen[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync display text when value changes externally
    useEffect(() => {
        setInputText(value?.nombreProducto ?? "");
    }, [value]);

    // Clear selection when almacen changes
    useEffect(() => {
        setInputText("");
        setResults([]);
        onChange(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [almacenId]);

    const search = (query: string) => {
        if (!almacenId) return;
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await apiClient.get("/api/producto/search/almacen", {
                    params: { almacenId, nombre: query.trim() },
                });
                setResults(res.data);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 280);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputText(text);
        if (text === "") {
            onChange(null);
            setResults([]);
            setOpen(false);
        } else {
            search(text);
        }
    };

    const handleSelect = (producto: ProductoResumen) => {
        onChange(producto);
        setInputText(producto.nombreProducto);
        setResults([]);
        setOpen(false);
    };

    const handleBlur = () => {
        // Delay so onMouseDown on a result fires first
        setTimeout(() => {
            setOpen(false);
            // If text doesn't match the current value, clear
            if (!value || inputText !== value.nombreProducto) {
                setInputText(value?.nombreProducto ?? "");
            }
        }, 180);
    };

    return (
        <Box sx={{ position: "relative", width: fullWidth ? "100%" : undefined }}>
            <TextField
                label={label}
                placeholder={placeholder}
                value={inputText}
                onChange={handleInputChange}
                onFocus={() => {
                    if (results.length > 0) setOpen(true);
                }}
                onBlur={handleBlur}
                disabled={disabled || !almacenId}
                required={required}
                size={size}
                fullWidth={fullWidth}
                error={error}
                helperText={helperText ?? (!almacenId ? "Seleccione un almacén primero" : undefined)}
                autoComplete="off"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {loading ? (
                                <CircularProgress size={16} />
                            ) : (
                                <SearchIcon fontSize="small" color="action" />
                            )}
                        </InputAdornment>
                    ),
                    endAdornment: value ? (
                        <InputAdornment position="end">
                            <Typography variant="caption" color="success.main" sx={{ pr: 0.5 }}>
                                ✓
                            </Typography>
                        </InputAdornment>
                    ) : undefined,
                }}
            />

            {open && results.length > 0 && (
                <Paper
                    elevation={6}
                    sx={{
                        position: "absolute",
                        zIndex: 1400,
                        width: "100%",
                        maxHeight: 240,
                        overflowY: "auto",
                        mt: 0.25,
                        borderRadius: 1,
                    }}
                >
                    {results.map((p) => (
                        <Box
                            key={p.id}
                            onMouseDown={() => handleSelect(p)}
                            sx={{
                                px: 2,
                                py: 1,
                                fontSize: 14,
                                cursor: "pointer",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                "&:hover": { bgcolor: "action.hover" },
                                "&:last-child": { borderBottom: "none" },
                            }}
                        >
                            {p.nombreProducto}
                        </Box>
                    ))}
                </Paper>
            )}

            {open && !loading && results.length === 0 && inputText.trim().length >= 2 && (
                <Paper
                    elevation={6}
                    sx={{ position: "absolute", zIndex: 1400, width: "100%", mt: 0.25, borderRadius: 1 }}
                >
                    <Box sx={{ px: 2, py: 1.5, fontSize: 14, color: "text.secondary" }}>
                        Sin resultados para "{inputText}"
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default ProductoAlmacenSearch;
