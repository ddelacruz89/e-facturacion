import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getFacturas } from '../../apis/FacturaController';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { IFacturaResumen } from '../../models/facturacion';
import { Control } from 'react-hook-form';
import { TextInputPkSearch, TextInputSearch } from '../CustomComponents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { SelectChangeEvent } from '@mui/material/Select';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface CustomPaginationProps {
    page: number;
    count: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

const CustomPagination = ({ page, count, rowsPerPage, onPageChange, onRowsPerPageChange }: CustomPaginationProps) => {
    const pageSizeOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 200);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', justifyContent: 'flex-end', p: 1 }}>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="rows-per-page-label">Filas por pág.</InputLabel>
                <Select
                    labelId="rows-per-page-label"
                    value={rowsPerPage}
                    label="Filas por pág."
                    onChange={onRowsPerPageChange}
                >
                    {pageSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                            {size}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Typography variant="body2">
                Página {page + 1} de {count}
            </Typography>

            <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="go-to-page-label">Ir a pág.</InputLabel>
                <Select
                    labelId="go-to-page-label"
                    value={page}
                    label="Ir a pág."
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                    {Array.from({ length: count }, (_, i) => (
                        <MenuItem key={i} value={i}>
                            {i + 1}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box>
                <IconButton
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    aria-label="página anterior"
                >
                    <ArrowBackIcon />
                </IconButton>
                <IconButton
                    onClick={() => onPageChange(page + 1)}
                    disabled={count === 0 || page >= count - 1}
                    aria-label="siguiente página"
                >
                    <ArrowForwardIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

type Size = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface ModalSearchFacturasProps {
    control: Control<any>;
    name: string;
    label: string;
    size: Size;
    pk?: boolean;
    onSelect: (factura: IFacturaResumen) => void;
}

export default function ModalSearchFacturas({ control, name, label, size, onSelect, pk = true }: ModalSearchFacturasProps) {
    const [open, setOpen] = React.useState(false);
    const [facturas, setFacturas] = React.useState<IFacturaResumen[]>([]);
    const [page, setPage] = React.useState(0);
    const [sizePage, setSizePage] = React.useState(200);
    const [totalPage, setTotalPage] = React.useState(0);
    const [totalElements, setTotalElements] = React.useState(0);

    const loadData = () => {
        getFacturas(page, sizePage).then((data) => {
            if (data) {
                setFacturas(data.content);
                setPage(data.page);
                setSizePage(data.size);
                setTotalPage(data.totalPage);
                setTotalElements(data.totalElements);
            }
        });
    };

    React.useEffect(() => {
        if (open) {
            loadData();
        }
    }, [page, sizePage, open]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // Reset pagination when closed if preferred
        // setPage(0);
    };

    return (
        <React.Fragment>
            {pk ? (
                <TextInputPkSearch control={control} name={name} label={label} disabled size={size} handleSearch={handleClickOpen} />
            ) : (
                <TextInputSearch control={control} name={name} label={label} disabled size={size} handleSearch={handleClickOpen} />
            )}
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth={true}
                maxWidth={"lg"}
                style={{ userSelect: "none" }}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Consultar Facturas
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <TableContainer component={Paper}>
                        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#525c71", color: "white" }}>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }}>ID</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">Secuencia</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">RNC</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">Razón Social</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">NCF</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">Fecha</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">Total</TableCell>
                                    <TableCell style={{ backgroundColor: "transparent", color: "white" }} align="right">Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {facturas.map((factura) => (
                                    <TableRow
                                        key={factura.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {factura.id}
                                        </TableCell>
                                        <TableCell align="right">{factura.secuencia}</TableCell>
                                        <TableCell align="right">{factura.rnc}</TableCell>
                                        <TableCell align="right">{factura.razonSocial}</TableCell>
                                        <TableCell align="right">{factura.ncf}</TableCell>
                                        <TableCell align="right">{factura.fechaReg}</TableCell>
                                        <TableCell align="right">
                                            {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(factura.total)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button variant="outlined" onClick={() => { onSelect(factura); handleClose() }}>
                                                Seleccionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <CustomPagination
                        page={page}
                        count={totalPage}
                        rowsPerPage={sizePage}
                        onPageChange={setPage}
                        onRowsPerPageChange={(e) => {
                            setSizePage(Number(e.target.value));
                            setPage(0); // Reset to first page on size change
                        }}
                    />
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
