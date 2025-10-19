import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import {
    Box,
    Grid,
    Button,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { AlphanumericInput } from "../../customers/CustomMUIComponents";
import ActionBar from "../../customers/ActionBar";
import { getCategorias, saveCategoria, updateCategoria, deleteCategoria } from "../../apis/CategoriaController";
import { MgCategoria } from "../../models/producto";

const CategoriaView = () => {
    const [categorias, setCategorias] = useState<MgCategoria[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<MgCategoria>({
        defaultValues: {
            id: "",
            categoria: "",
            modificable: true,
            tieneModulo: false,
            llevaMedida: false,
        },
    });

    // Load categorias on component mount
    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = () => {
        getCategorias()
            .then((response) => {
                setCategorias(response);
            })
            .catch((error) => {
                console.error("Error al cargar categorías:", error);
            });
    };

    const onSubmit: SubmitHandler<MgCategoria> = (data) => {
        const action = editingId ? updateCategoria(editingId, data) : saveCategoria(data);

        action
            .then((response) => {
                alert(`Categoría ${editingId ? "actualizada" : "guardada"} correctamente`);
                reset();
                setEditingId(null);
                loadCategorias();
            })
            .catch((error) => {
                console.error("Error al guardar la categoría:", error);
                alert("Error al guardar la categoría");
            });
    };

    const handleEdit = (categoria: MgCategoria) => {
        setValue("id", categoria.id);
        setValue("categoria", categoria.categoria);
        setValue("modificable", categoria.modificable);
        setValue("tieneModulo", categoria.tieneModulo);
        setValue("llevaMedida", categoria.llevaMedida);
        setEditingId(categoria.id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("¿Está seguro de eliminar esta categoría?")) {
            deleteCategoria(id)
                .then(() => {
                    alert("Categoría eliminada correctamente");
                    loadCategorias();
                })
                .catch((error) => {
                    console.error("Error al eliminar la categoría:", error);
                    alert("Error al eliminar la categoría");
                });
        }
    };

    const handleNew = () => {
        reset();
        setEditingId(null);
    };

    const onError = (errors: FieldErrors<MgCategoria>) => {
        console.log("Errores de validación:", errors);
    };

    return (
        <main>
            <Box component="form" onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title="Categorías de Producto">
                    <Button size="small" color="primary" type="submit">
                        {editingId ? "Actualizar" : "Guardar"}
                    </Button>
                    <Button size="small" type="button" onClick={handleNew}>
                        Nuevo
                    </Button>
                </ActionBar>

                <section>
                    <Grid container spacing={2}>
                        <AlphanumericInput
                            label="ID de Categoría"
                            size={3}
                            name="id"
                            control={control}
                            error={errors.id}
                            rules={{
                                required: "Campo requerido",
                                maxLength: { value: 4, message: "Máximo 4 caracteres" },
                            }}
                            disabled={!!editingId}
                        />
                        <AlphanumericInput
                            label="Nombre de Categoría"
                            size={9}
                            name="categoria"
                            control={control}
                            error={errors.categoria}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            }}
                        />
                    </Grid>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={watch("modificable")}
                                    onChange={(e) => setValue("modificable", e.target.checked)}
                                />
                            }
                            label="Modificable"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={watch("tieneModulo")}
                                    onChange={(e) => setValue("tieneModulo", e.target.checked)}
                                />
                            }
                            label="Tiene Módulo"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={watch("llevaMedida")}
                                    onChange={(e) => setValue("llevaMedida", e.target.checked)}
                                />
                            }
                            label="Lleva Medida"
                        />
                    </Box>

                    {/* Categories Table */}
                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Categoría</TableCell>
                                    <TableCell align="center">Modificable</TableCell>
                                    <TableCell align="center">Tiene Módulo</TableCell>
                                    <TableCell align="center">Lleva Medida</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categorias.map((categoria) => (
                                    <TableRow key={categoria.id}>
                                        <TableCell>{categoria.id}</TableCell>
                                        <TableCell>{categoria.categoria}</TableCell>
                                        <TableCell align="center">{categoria.modificable ? "✓" : "✗"}</TableCell>
                                        <TableCell align="center">{categoria.tieneModulo ? "✓" : "✗"}</TableCell>
                                        <TableCell align="center">{categoria.llevaMedida ? "✓" : "✗"}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleEdit(categoria)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(categoria.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </section>
            </Box>
        </main>
    );
};

export default CategoriaView;
