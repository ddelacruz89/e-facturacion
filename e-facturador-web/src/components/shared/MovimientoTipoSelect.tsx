import React, { useEffect, useState } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    CircularProgress,
    FormHelperText,
} from "@mui/material";
import { InMovimientoTipo, getMovimientoTiposByModulo } from "../../apis/InMovimientoTipoController";

interface Props {
    /** Código de módulo para filtrar, ej. "AI", "OE", "OC". */
    modulo: string;
    value: number | "";
    onChange: (value: number | "") => void;
    /** Callback adicional que recibe el objeto completo seleccionado (con cr, etc.). */
    onChangeTipo?: (tipo: InMovimientoTipo | null) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    size?: "small" | "medium";
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
}

const MovimientoTipoSelect: React.FC<Props> = ({
    modulo,
    value,
    onChange,
    onChangeTipo,
    label = "Motivo",
    required = false,
    disabled = false,
    size = "small",
    fullWidth = true,
    error = false,
    helperText,
}) => {
    const [tipos, setTipos] = useState<InMovimientoTipo[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!modulo) return;
        setLoading(true);
        getMovimientoTiposByModulo(modulo)
            .then(setTipos)
            .catch(() => setTipos([]))
            .finally(() => setLoading(false));
    }, [modulo]);

    const handleChange = (e: SelectChangeEvent<number | "">) => {
        const raw = e.target.value;
        const id = raw === "" ? "" : Number(raw);
        onChange(id);
        if (onChangeTipo) {
            const found = tipos.find((t) => t.id === id) ?? null;
            onChangeTipo(found);
        }
    };

    const labelId = `movimiento-tipo-select-label-${modulo}`;

    return (
        <FormControl
            size={size}
            fullWidth={fullWidth}
            required={required}
            disabled={disabled || loading}
            error={error}
        >
            <InputLabel id={labelId}>
                {loading ? "Cargando…" : label}
            </InputLabel>
            <Select
                labelId={labelId}
                label={loading ? "Cargando…" : label}
                value={value}
                onChange={handleChange}
                startAdornment={
                    loading ? (
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                    ) : undefined
                }
            >
                <MenuItem value="">
                    <em>— Seleccione —</em>
                </MenuItem>
                {tipos.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                        {t.tipoMovimiento}
                    </MenuItem>
                ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default MovimientoTipoSelect;
