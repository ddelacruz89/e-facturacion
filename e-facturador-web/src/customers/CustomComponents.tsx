import { AccountCircle, Key, CheckCircle, Cancel } from "@mui/icons-material";
import {
    FormControlLabel,
    Grid,
    InputAdornment,
    Paper,
    Switch,
    TablePagination,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TableFooter,
    FormHelperText,
    FormControl,
    IconButton,
} from "@mui/material";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import { yellow } from "@mui/material/colors";
import React, { ReactNode } from "react";
import { Controller, Control, FieldError } from "react-hook-form";
import { formatCurrency } from "../utils/FacturaUtils";
import { NumericFormat } from 'react-number-format';
import SearchIcon from '@mui/icons-material/Search';
type Size = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type BaseProps = {
    disabled?: boolean;
    readOnly?: boolean;
    name: string;
    label: string;
    control: Control<any>;
    error?: FieldError;
    rules?: object;
    prefix?: string;
    size: Size;
};
export function TextInput({ name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: BaseProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <TextField
                            disabled={disabled}
                            slotProps={{
                                input: {
                                    readOnly: readOnly,
                                },
                            }}
                            id={name}
                            fullWidth
                            label={label}
                            error={!!error}
                            variant="outlined"
                            {...field}
                            {...rest}
                            size="small"
                        />
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />
    );
}

export function NumberInput({ name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: BaseProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <TextField
                            disabled={disabled}
                            slotProps={{
                                input: {
                                    readOnly: readOnly,
                                },
                            }}
                            id={name}
                            type="number"
                            fullWidth
                            label={label}
                            error={!!error}
                            variant="outlined"
                            {...field}
                            {...rest}
                            size="small"
                        />
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>

            )}
        />
    );
}

export function MoneyInput({ name, disabled, readOnly, label, control, error, rules, prefix, size = 12, ...rest }: BaseProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field: { onChange, name, value, ref } }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControl fullWidth error={!!error}>
                        <NumericFormat
                            customInput={TextField}
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            allowNegative={false}
                            disabled={disabled}
                            getInputRef={ref}
                            fullWidth
                            label={label}
                            error={!!error}
                            variant="outlined"
                            name={name}
                            value={Number(value) <= 0 ? "" : value}
                            onValueChange={(values) => {
                                onChange(values.floatValue);
                            }}
                            slotProps={{
                                input: {
                                    readOnly: readOnly,
                                    startAdornment: (
                                        <InputAdornment position="start">{prefix}</InputAdornment>
                                    ),
                                },
                            }}
                            {...rest}
                            size="small"
                        />
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                </Grid>
            )}
        />
    );
}

export function TextInputPk({ name, disabled, readOnly, label, control, error, rules, size = 12, ...rest }: BaseProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <TextField
                        disabled={disabled}
                        slotProps={{
                            input: {
                                readOnly: readOnly,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Key sx={{ color: yellow[700], rotate: "90  deg" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        id={name}
                        fullWidth
                        label={label}
                        variant="outlined"
                        {...field}
                        {...rest}
                        size="small"
                    />
                </Grid>
                //   {/* {error && <FormFeedback>{error.message}</FormFeedback>} */}
            )}
        />
    );
}
interface TextInputPkSearchProps extends BaseProps {
    handleSearch: () => void;
}

export function TextInputPkSearch({ name, disabled, readOnly, label, control, error, rules, size, handleSearch, ...rest }: TextInputPkSearchProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <TextField
                        disabled={disabled}
                        slotProps={{
                            input: {
                                readOnly: readOnly,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Key sx={{ color: yellow[700], rotate: "90  deg" }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon color="primary" style={{ cursor: "pointer" }} onClick={handleSearch} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        id={name}
                        fullWidth
                        label={label}
                        variant="outlined"
                        {...field}
                        {...rest}
                        size="small"
                    />
                </Grid>
                //   {/* {error && <FormFeedback>{error.message}</FormFeedback>} */}
            )}
        />
    );
}

export function TextInputSearch({ name, disabled, readOnly, label, control, error, rules, size, handleSearch, ...rest }: TextInputPkSearchProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <TextField
                        disabled={disabled}
                        slotProps={{
                            input: {
                                readOnly: readOnly,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon color="primary" style={{ cursor: "pointer" }} onClick={handleSearch} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        id={name}
                        fullWidth
                        label={label}
                        variant="outlined"
                        {...field}
                        {...rest}
                        size="small"
                    />
                </Grid>
                //   {/* {error && <FormFeedback>{error.message}</FormFeedback>} */}
            )}
        />
    );
}

export function EmailInput({
    name,
    disabled,
    readOnly,
    label = "Correo Electrónico",
    control,
    error,
    rules,
    size = 12,
    ...rest
}: BaseProps) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Ingresa un correo electrónico válido",
                },
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <TextField
                        disabled={disabled}
                        slotProps={{
                            input: {
                                readOnly: readOnly,
                            },
                        }}
                        id={name}
                        type="email"
                        fullWidth
                        label={label}
                        variant="outlined"
                        error={!!error}
                        helperText={error?.message}
                        {...field}
                        {...rest}
                        size="small"
                    />
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                </Grid>
            )}
        />
    );
}

export function SwitchInput({
    name,
    disabled,
    readOnly,
    label,
    control,
    error,
    rules,
    isChecked = false,
    size = 12,
    ...rest
}: BaseProps & { isChecked?: boolean }) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
            }}
            render={({ field }) => (
                <Grid size={{ xs: 12, sm: size }}>
                    <FormControlLabel
                        control={<Switch checked={Boolean(field.value)} onChange={field.onChange} inputRef={field.ref} />}
                        disabled={disabled}
                        label={label}
                    />
                </Grid>
                //   {/* {error && <FormFeedback>{error.message}</FormFeedback>} */}
            )}
        />
    );
}

export interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: "right" | "left" | "center";
    format?: (value: number) => string;
    onChange?: (value: string, row: any, column: string) => void;
}
export interface PropsTable {
    columns: Column[];
    rows: any[];
    selected?: (selected: any) => void;
    handleDelete?: (selected: any) => void;

}
export function TableComponent({ columns, rows, selected }: PropsTable) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    return (
        <Paper sx={{ width: "100%" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth, backgroundColor: "#263238", color: "white" }}>
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rows || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            return (
                                <TableRow
                                    style={{ cursor: "pointer" }}
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={row.code}
                                    onClick={() => selected && selected(row)}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        let displayValue = value;

                                        // Handle boolean values
                                        if (typeof value === "boolean") {
                                            displayValue = value ? "Sí" : "No";
                                        }

                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                {column.onChange && typeof value === 'number' && column.id !== 'id' ? (
                                                    <TextField
                                                        value={value}
                                                        onChange={(e) => column.onChange && column.onChange(e.target.value, row, column.id)}
                                                        type="number"
                                                        size="small"
                                                        variant="standard"
                                                        fullWidth
                                                    />
                                                ) : (
                                                    column.format && typeof value === "number" ? column.format(value) : displayValue
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={(rows || []).length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

export function TableComponentFacturacion({ columns, rows, selected, handleDelete }: PropsTable) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    return (
        <Paper sx={{ width: "100%" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth, backgroundColor: "#263238", color: "white" }}>
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell
                                align="center"
                                style={{ minWidth: 100, backgroundColor: "#263238", color: "white" }}>
                                Acciones
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rows || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            return (
                                <TableRow
                                    style={{ cursor: "pointer" }}
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={row.code}
                                    onClick={() => selected && selected(row)}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        let displayValue = value;

                                        // Handle boolean values
                                        if (typeof value === "boolean") {
                                            displayValue = value ? "Sí" : "No";
                                        }

                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                {column.onChange && typeof value === 'number' && column.id !== 'id' ? (
                                                    <TextField
                                                        value={value}
                                                        onChange={(e) => column.onChange && column.onChange(e.target.value, row, column.id)}
                                                        type="number"
                                                        size="small"
                                                        variant="standard"
                                                        sx={{ width: 50 }}
                                                    />
                                                ) : (
                                                    column.format && typeof value === "number" ? column.format(value) : displayValue
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell align="center">
                                        <IconButton color="error" aria-label="delete" onClick={() => handleDelete && handleDelete(row)}>
                                            <DeleteOutlinedIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {rows.length > 0 && (
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, borderTop: "1px solid #e0e0e0" }}>
                    <Typography variant="h6" color="text.secondary">
                        SubTotal: {formatCurrency(rows.reduce((acc, row) => acc + row.montoVenta, 0))}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        ITBIS: {formatCurrency(rows.reduce((acc, row) => acc + row.montoItbis, 0))}
                    </Typography>
                    <Typography variant="h5" color="text.primary" fontWeight="bold">
                        Total: {formatCurrency(rows.reduce((acc, row) => acc + row.montoTotal, 0))}
                    </Typography>
                </Box>
            )}
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={(rows || []).length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
interface ConfirmationModalProps {
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    open,
    title = "Confirmar Acción",
    message = "¿Está seguro de que desea continuar?",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    confirmColor = "primary",
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    padding: 1,
                },
            }}>
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    paddingBottom: 1,
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                }}>
                <CheckCircle color={confirmColor} />
                {title}
            </DialogTitle>

            <DialogContent sx={{ paddingTop: 2 }}>
                <Typography variant="body1" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ padding: 2, gap: 1 }}>
                <Button onClick={onCancel} variant="outlined" color="inherit" startIcon={<Cancel />} sx={{ minWidth: 100 }}>
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={confirmColor}
                    startIcon={<CheckCircle />}
                    sx={{ minWidth: 100 }}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

interface GridProps {
    children?: ReactNode;
}
export function GridRow({ children }: GridProps) {
    return (
        <Grid container size={{ xs: 12, sm: 12 }} spacing={2}>
            {children}
        </Grid>
    );
}
