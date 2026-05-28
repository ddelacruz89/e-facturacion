import { FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText } from "@mui/material";
import { TipoComprobante, TipoFactura } from "../models/facturacion";
import { useEffect, useState } from "react";
import { getTipoFacturas } from "../apis/TipoFacturaController";
import { Control, Controller, FieldError } from "react-hook-form";
import { getTipoComprobantes, getTipoComprobantesByCategoria } from "../apis/TipoComprobanteController";
import { comboBoxStore } from "../store/ComboBoxStore";
import { getRetenciones } from "../apis/GeneralController";


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
    categoria?: string;
}

export function TipoFacturaSelect({ handleGetItem, name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: SelectOption) {
    const { tipoFacturas, setTipoFacturas } = comboBoxStore();
    useEffect(() => {
        if (tipoFacturas.length === 0)
            getTipoFacturas().then(x => setTipoFacturas(x))

    }, [])
    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <InputLabel id="demo-simple-select-label">TipoFactura</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="tipoFactura"
                            {...field}
                            {...rest}>
                            <MenuItem value="">Elegir</MenuItem>
                            {
                                tipoFacturas.map((option: TipoFactura) =>
                                    <MenuItem
                                        onClick={() => handleGetItem && handleGetItem(option)}
                                        key={option.id}
                                        value={option.id}>{option.id} - {option.nombre}</MenuItem>)
                            }

                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />

    )
}

export function TipoComprobanteSelect({ handleGetItem, name, disabled, readOnly, label, control, error, rules, size = 12, categoria, ...rest }: SelectOption) {
    const { tipoComprobantes, setTipoComprobantes } = comboBoxStore();
    const [filtrados, setFiltrados] = useState<TipoComprobante[]>([]);

    useEffect(() => {
        if (categoria) {
            getTipoComprobantesByCategoria(categoria).then(x => setFiltrados(x));
        } else if (tipoComprobantes.length === 0) {
            getTipoComprobantes().then(x => setTipoComprobantes(x));
        }
    }, [categoria])

    const opciones = categoria ? filtrados : tipoComprobantes;
    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <InputLabel id="demo-simple-select-label">Tipo Comprobante</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="tipoComprobanteId"
                            {...field}
                            {...rest}>
                            <MenuItem value="">Elegir</MenuItem>
                            {
                                opciones.map((option: TipoComprobante) =>
                                    <MenuItem
                                        onClick={() => handleGetItem && handleGetItem(option)}
                                        key={option.id}
                                        value={option.id}>{option.id} - {option.tipoComprobante}</MenuItem>)
                            }

                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />

    )
}


export function TipoIdentificacionSelect({ handleGetItem, name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: SelectOption) {

    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <InputLabel id="demo-simple-select-label">Tipo Identificacion</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="tipoIdentificacion"
                            {...field}
                            {...rest}>
                            <MenuItem value="">Elegir</MenuItem>
                            <MenuItem
                                onClick={() => handleGetItem && handleGetItem(1)}
                                key={1}
                                value={1}>1 - Cedula</MenuItem>
                            <MenuItem
                                onClick={() => handleGetItem && handleGetItem(2)}
                                key={2}
                                value={2}>2 - RNC</MenuItem>
                            <MenuItem
                                onClick={() => handleGetItem && handleGetItem(3)}
                                key={3}
                                value={3}>3 - Pasaporte</MenuItem>

                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />

    )
}

export function TipoRetencionSelect({ handleGetItem, name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: SelectOption) {

    const tipoRetenciones = [
        { id: 0, nombre: "ITBIS" },
        { id: 1, nombre: "ISR" }
    ]

    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <InputLabel id="demo-simple-select-label">Retencion</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="retencionId"
                            {...field}
                            {...rest}>
                            <MenuItem value="">Elegir</MenuItem>
                            {
                                tipoRetenciones.map((option: any) =>
                                    <MenuItem
                                        onClick={() => handleGetItem && handleGetItem(option)}
                                        key={option.id}
                                        value={option.id}>{option.nombre}</MenuItem>)
                            }

                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />

    )
}

export function RetencionesSelect({ handleGetItem, name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: SelectOption) {

    const { retenciones, setRetenciones } = comboBoxStore();
    useEffect(() => {
        if (retenciones.length === 0)
            getRetenciones().then(x => setRetenciones(x))

    }, [])

    return (
        <Controller
            name={name}
            control={control}
            rules={{ ...rules }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <InputLabel id="demo-simple-select-label">Retencion</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="retencionId"
                            {...field}
                            {...rest}>
                            <MenuItem value="">Elegir</MenuItem>
                            {
                                retenciones.map((option: any) =>
                                    <MenuItem
                                        onClick={() => handleGetItem && handleGetItem(option)}
                                        key={option.id}
                                        value={option.id}>{option.nombre}</MenuItem>)
                            }

                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />

    )
}
