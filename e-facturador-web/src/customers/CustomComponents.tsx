import { AccountCircle, Key } from "@mui/icons-material";
import { FormControlLabel, Grid, InputAdornment, Paper, Switch, TablePagination, TextField } from "@mui/material";
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import { yellow } from "@mui/material/colors";
import React, { ReactNode } from "react";
import { Controller, Control, FieldError } from "react-hook-form";
type Size = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type BaseProps = {
    disabled?: boolean;
    readOnly?: boolean;
    name: string;
    label: string;
    control: Control<any>;
    error?: FieldError;
    rules?: object;
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
                    <TextField
                        disabled={disabled}
                        slotProps={{
                            input: {
                                readOnly: readOnly, // ✅ ahora se usa aquí
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
}
export interface PropsTable {
    columns: Column[];
    rows: any[];
    selected?: (selected: any) => void;
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
                                                {column.format && typeof value === "number" ? column.format(value) : displayValue}
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
