import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { SgUsuarioResumenDTO } from "../../models/seguridad";
import { buscarUsuarios } from "../../apis/UsuarioController";

interface Props {
    value: string;
    onChange: (username: string) => void;
    label?: string;
    disabled?: boolean;
    size?: "small" | "medium";
    fullWidth?: boolean;
}

const UserSelectorField: React.FC<Props> = ({
    value,
    onChange,
    label = "Conductor",
    disabled = false,
    size = "small",
    fullWidth = true,
}) => {
    const [usuarios, setUsuarios] = useState<SgUsuarioResumenDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        buscarUsuarios({})
            .then(setUsuarios)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const selected = usuarios.find((u) => u.username === value) ?? null;

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
