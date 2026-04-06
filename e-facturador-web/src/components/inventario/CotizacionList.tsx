import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { InCotizacion } from "../../models/inventario";

interface CotizacionListProps {
    cotizaciones: InCotizacion[];
    onEdit: (cotizacion: InCotizacion) => void;
    onDelete: (id: number) => void;
}

const getPrioridadColor = (prioridad: string | undefined) => {
    switch (prioridad) {
        case "URGENTE":
            return "error";
        case "ALTA":
            return "warning";
        case "MEDIA":
            return "info";
        case "BAJA":
            return "default";
        default:
            return "default";
    }
};

const CotizacionList: React.FC<CotizacionListProps> = ({ cotizaciones, onEdit, onDelete }) => {
    const formatDate = (date: Date | undefined) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("es-DO", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Prioridad</TableCell>
                        <TableCell>Fecha Registro</TableCell>
                        <TableCell>Detalles</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cotizaciones.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No hay cotizaciones registradas
                            </TableCell>
                        </TableRow>
                    ) : (
                        cotizaciones.map((cotizacion) => (
                            <TableRow key={cotizacion.id} hover onClick={() => onEdit(cotizacion)} style={{ cursor: "pointer" }}>
                                <TableCell>{cotizacion.id}</TableCell>
                                <TableCell>{cotizacion.descripcion}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={cotizacion.prioridad}
                                        color={getPrioridadColor(cotizacion.prioridad)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{formatDate(cotizacion.fechaReg)}</TableCell>
                                <TableCell>{cotizacion.inCotizacionesDetallesCollection?.length || 0} productos</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(cotizacion);
                                        }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (cotizacion.id) {
                                                onDelete(cotizacion.id);
                                            }
                                        }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CotizacionList;
