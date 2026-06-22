import React, { useEffect, useState } from "react";
import { Autocomplete, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SgUsuarioResumenDTO } from "../../models/seguridad";
import { buscarUsuarios } from "../../apis/UsuarioController";

interface Props {
    value: string;
    onChange: (username: string) => void;
    label?: string;
    disabled?: boolean;
    size?: "small" | "medium";
    fullWidth?: boolean;
    soloChoferes?: boolean;
}

const UserSelectorField: React.FC<Props> = ({
    value,
    onChange,
    label = "Conductor",
    disabled = false,
    size = "small",
    fullWidth = true,
    soloChoferes = false,
}) => {
    const [usuarios, setUsuarios] = useState<SgUsuarioResumenDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setLoaded(false);
        buscarUsuarios({ soloChoferes })
            .then(setUsuarios)
            .catch(console.error)
            .finally(() => { setLoading(false); setLoaded(true); });
    }, [soloChoferes]);

    const selected = usuarios.find((u) => u.username === value) ?? null;

    const noOptionsNode =
        soloChoferes && loaded ? (
            <Box sx={{ p: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    No hay choferes registrados.
                </Typography>
                <Button
                    size="small"
                    variant="text"
                    sx={{ p: 0, textTransform: "none", fontSize: "0.8rem" }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        navigate("/usuario");
                    }}
                >
                    Ir a Usuarios y marcar la opción Chofer
                </Button>
            </Box>
        ) : "Sin opciones";

    return (
        <Autocomplete
            options={usuarios}
            getOptionLabel={(u) => `${u.nombre} (${u.username})`}
            value={selected}
            onChange={(_e, opt) => onChange(opt?.username ?? "")}
            loading={loading}
            disabled={disabled}
            fullWidth={fullWidth}
            size={size}
            noOptionsText={noOptionsNode}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    size={size}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading && <CircularProgress size={14} />}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

export default UserSelectorField;
