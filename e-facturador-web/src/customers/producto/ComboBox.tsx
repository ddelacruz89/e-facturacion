import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import { TipoComprobante, TipoFactura } from "../../models/facturacion";
import { useEffect, useState } from "react";
import { getTipoFacturas } from "../../apis/TipoFacturaController";
import { Control, Controller, FieldError } from "react-hook-form";
import { getTipoComprobantes } from "../../apis/TipoComprobanteController";
import { comboBoxStore } from "../../store/ComboBoxStore";

type Size = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
interface SelectOption {
    disabled?: boolean;
    readOnly?: boolean;
    name: string;
    label: string;
    control: Control<any>;
    error?: FieldError;
    rules?: object;
    size?: Size;
    handleGetItem?: (selected: any) => void;
}

export function TipoFacturaSelect({
    handleGetItem,
    name,
    disabled,
    readOnly,
    label,
    control,
    error,
    rules,
    size = 12,
    ...rest
}: SelectOption) {
    const { tipoFacturas, setTipoFacturas } = comboBoxStore();
    useEffect(() => {
        if (tipoFacturas.length === 0) getTipoFacturas().then((x) => setTipoFacturas(x));
    }, []);
    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">TipoFactura</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="tipoFactura"
                            {...field}
                            {...rest}>
                            <MenuItem value="0">Elegir</MenuItem>
                            {tipoFacturas.map((option: TipoFactura) => (
                                <MenuItem
                                    onClick={() => handleGetItem && handleGetItem(option)}
                                    key={option.id}
                                    value={option.id}>
                                    {option.id} - {option.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                //   {/* {error && <FormFeedback>{error.message}</FormFeedback>} */}
            )}
        />
    );
}

export function TipoComprobanteSelect({
    handleGetItem,
    name,
    disabled,
    readOnly,
    label,
    control,
    error,
    rules,
    size = 12,
    ...rest
}: SelectOption) {
    const { tipoComprobantes, setTipoComprobantes } = comboBoxStore();
    useEffect(() => {
        if (tipoComprobantes.length === 0) getTipoComprobantes().then((x) => setTipoComprobantes(x));
    }, []);
    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Tipo Comprobante</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="tipoComprobanteId"
                            {...field}
                            {...rest}>
                            <MenuItem value="">Elegir</MenuItem>
                            {tipoComprobantes.map((option: TipoComprobante) => (
                                <MenuItem
                                    onClick={() => handleGetItem && handleGetItem(option)}
                                    key={option.id}
                                    value={option.id}>
                                    {option.id} - {option.tipoComprobante}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                //   {/* {error && <FormFeedback>{error.message}</FormFeedback>} */}
            )}
        />
    );
}
