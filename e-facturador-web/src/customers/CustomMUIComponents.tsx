import React, { forwardRef } from "react";
import { Controller, Control, FieldError } from "react-hook-form";
import { Box, FormControl, InputLabel, TextField, Select, MenuItem, FormHelperText, SelectChangeEvent } from "@mui/material";
import { NumericFormat, NumberFormatValues } from "react-number-format";
import { JSX } from "react/jsx-runtime";
// Tipo restringido: solo permite del 1 al 12
type Size = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type InputType = "text" | "select" | "number" | "email" | "password";

type BaseProps = {
    name: string;
    label: string;
    control: Control<any>;
    type?: InputType;
    error?: FieldError;
    rules?: object;
    size?: Size;
    placeholder?: string;
    disabled?: boolean;
    onBlur?: (value: any) => void;
};

// ───────────────────────────────────────────────
// NumericInput
// ───────────────────────────────────────────────
export function NumericInput({ name, label, control, error, rules, size = 12, onBlur: customOnBlur, ...rest }: BaseProps) {
    return (
        <Box sx={{ width: `${(size / 12) * 100}%`, mb: 2 }}>
            <Controller
                name={name}
                control={control}
                rules={{
                    pattern: {
                        value: /^[0-9]+$/,
                        message: "Solo se permiten números",
                    },
                    ...rules,
                }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        {...rest}
                        label={label}
                        type="text"
                        size="small"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                        onBlur={(e) => {
                            field.onBlur();
                            if (customOnBlur) {
                                customOnBlur(field.value);
                            }
                        }}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
                            if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onPaste={(e: React.ClipboardEvent) => {
                            const text = e.clipboardData.getData("Text");
                            if (!/^\d+$/.test(text)) e.preventDefault();
                        }}
                    />
                )}
            />
        </Box>
    );
}

// ───────────────────────────────────────────────
// AlphanumericInput
// ───────────────────────────────────────────────
export function AlphanumericInput({ type, name, label, control, error, rules, size = 12, ...rest }: BaseProps) {
    return (
        <Box sx={{ width: `${(size / 12) * 100}%`, mb: 2 }}>
            <Controller
                name={name}
                control={control}
                rules={{
                    ...rules,
                }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        {...rest}
                        label={label}
                        type={type || "text"}
                        size="small"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                    />
                )}
            />
        </Box>
    );
}

// ───────────────────────────────────────────────
// SelectInput
// ───────────────────────────────────────────────
type Option = { value: string; label: string };
type SelectProps = BaseProps & { options: Option[] };

export function SelectInput({ name, label, control, error, options, rules, size = 12, ...rest }: SelectProps) {
    return (
        <Box sx={{ width: `${(size / 12) * 100}%`, mb: 2 }}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!error}>
                        <InputLabel>{label}</InputLabel>
                        <Select {...field} {...rest} label={label}>
                            <MenuItem value="">
                                <em>Selecciona una opción</em>
                            </MenuItem>
                            {options.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                )}
            />
        </Box>
    );
}

// ───────────────────────────────────────────────
// MoneyInput
// ───────────────────────────────────────────────
// Custom input component for NumericFormat - defined outside to prevent re-renders
const MoneyCustomInput = forwardRef<HTMLInputElement, any>((props, ref) => {
    const { error, helperText, ...otherProps } = props;
    return <TextField {...otherProps} ref={ref} size="small" fullWidth error={error} helperText={helperText} />;
});

export function MoneyInput({ name, label, control, error, rules, size = 12, ...rest }: BaseProps) {
    return (
        <Box sx={{ width: `${(size / 12) * 100}%`, mb: 2 }}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <NumericFormat
                        {...rest}
                        name={field.name}
                        value={field.value}
                        onBlur={field.onBlur}
                        label={label}
                        decimalScale={2}
                        fixedDecimalScale
                        thousandSeparator=","
                        type="text"
                        prefix={"RD$ "}
                        customInput={MoneyCustomInput}
                        error={!!error}
                        helperText={error?.message}
                        onValueChange={(values: NumberFormatValues) => {
                            field.onChange(values.floatValue || 0);
                        }}
                    />
                )}
            />
        </Box>
    );
}
