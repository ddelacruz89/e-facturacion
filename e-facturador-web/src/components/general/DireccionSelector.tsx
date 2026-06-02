import React, { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  Grid,
  TextField,
} from "@mui/material";
import {
  DireccionValue,
  getBarriosByMunicipio,
  getMunicipiosByProvincia,
  getProvincias,
  getSubBarriosByBarrio,
  MgBarrioParajeResumen,
  MgMunicipioResumen,
  MgProvincia,
  MgSubBarrioResumen,
} from "../../apis/UbicacionController";

interface Props {
  value: DireccionValue;
  onChange: (v: DireccionValue) => void;
  disabled?: boolean;
  /** Si true, muestra campos de calle y referencia */
  showDireccionTextual?: boolean;
}

export default function DireccionSelector({
  value,
  onChange,
  disabled = false,
  showDireccionTextual = true,
}: Props) {
  const [provincias, setProvincias] = useState<MgProvincia[]>([]);
  const [municipios, setMunicipios] = useState<MgMunicipioResumen[]>([]);
  const [barrios, setBarrios] = useState<MgBarrioParajeResumen[]>([]);
  const [subBarrios, setSubBarrios] = useState<MgSubBarrioResumen[]>([]);

  const [loadingMun, setLoadingMun] = useState(false);
  const [loadingBrr, setLoadingBrr] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  // Carga provincias una sola vez
  useEffect(() => {
    getProvincias()
      .then(setProvincias)
      .catch((err) => console.error("[DireccionSelector] Error cargando provincias:", err));
  }, []);

  // Carga municipios al cambiar provincia
  useEffect(() => {
    if (!value.codProvincia) {
      setMunicipios([]);
      return;
    }
    setLoadingMun(true);
    getMunicipiosByProvincia(value.codProvincia)
      .then(setMunicipios)
      .catch((err) => console.error("[DireccionSelector] Error cargando municipios:", err))
      .finally(() => setLoadingMun(false));
  }, [value.codProvincia]);

  // Carga barrios al cambiar municipio
  useEffect(() => {
    if (!value.municipioId) {
      setBarrios([]);
      return;
    }
    setLoadingBrr(true);
    getBarriosByMunicipio(value.municipioId)
      .then(setBarrios)
      .catch((err) => console.error("[DireccionSelector] Error cargando barrios:", err))
      .finally(() => setLoadingBrr(false));
  }, [value.municipioId]);

  // Carga sub-barrios al cambiar barrio
  useEffect(() => {
    if (!value.barrioId) {
      setSubBarrios([]);
      return;
    }
    setLoadingSub(true);
    getSubBarriosByBarrio(value.barrioId)
      .then(setSubBarrios)
      .catch((err) => console.error("[DireccionSelector] Error cargando sub-barrios:", err))
      .finally(() => setLoadingSub(false));
  }, [value.barrioId]);

  const handleProvincia = useCallback(
    (_: unknown, prov: MgProvincia | null) => {
      onChange({
        codProvincia: prov?.codProvincia,
        municipioId: undefined,
        barrioId: undefined,
        subBarrioId: undefined,
        calle: value.calle,
        referencia: value.referencia,
      });
    },
    [onChange, value.calle, value.referencia]
  );

  const handleMunicipio = useCallback(
    (_: unknown, mun: MgMunicipioResumen | null) => {
      onChange({
        ...value,
        municipioId: mun?.id,
        barrioId: undefined,
        subBarrioId: undefined,
      });
    },
    [onChange, value]
  );

  const handleBarrio = useCallback(
    (_: unknown, brr: MgBarrioParajeResumen | null) => {
      onChange({ ...value, barrioId: brr?.id, subBarrioId: undefined });
    },
    [onChange, value]
  );

  const handleSubBarrio = useCallback(
    (_: unknown, sub: MgSubBarrioResumen | null) => {
      onChange({ ...value, subBarrioId: sub?.id });
    },
    [onChange, value]
  );

  const selectedProvincia =
    provincias.find((p) => p.codProvincia === value.codProvincia) ?? null;
  const selectedMunicipio =
    municipios.find((m) => m.id === value.municipioId) ?? null;
  const selectedBarrio =
    barrios.find((b) => b.id === value.barrioId) ?? null;
  const selectedSubBarrio =
    subBarrios.find((s) => s.id === value.subBarrioId) ?? null;

  return (
    <Grid container spacing={2}>
      {/* Provincia */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Autocomplete
          options={provincias}
          getOptionLabel={(o) => o.nombre}
          value={selectedProvincia}
          onChange={handleProvincia}
          disabled={disabled}
          renderInput={(params) => (
            <TextField {...params} label="Provincia" size="small" />
          )}
        />
      </Grid>

      {/* Municipio / DM */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Autocomplete
          options={municipios}
          getOptionLabel={(o) => (o.esDm ? `${o.nombre} (DM)` : o.nombre)}
          groupBy={(o) => (o.esDm ? "Distritos Municipales" : "Municipios")}
          value={selectedMunicipio}
          onChange={handleMunicipio}
          disabled={disabled || !value.codProvincia}
          loading={loadingMun}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Municipio / Distrito Municipal"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingMun && <CircularProgress size={16} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>

      {/* Barrio / Paraje */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Autocomplete
          options={barrios}
          getOptionLabel={(o) => o.nombre}
          value={selectedBarrio}
          onChange={handleBarrio}
          disabled={disabled || !value.municipioId}
          loading={loadingBrr}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Barrio / Paraje"
              size="small"
              helperText={
                selectedBarrio?.precioEnvio != null
                  ? `Envío: RD$${selectedBarrio.precioEnvio.toFixed(2)}`
                  : undefined
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingBrr && <CircularProgress size={16} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>

      {/* Sub-barrio (solo si el barrio tiene hijos) */}
      {(subBarrios.length > 0 || loadingSub) && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={subBarrios}
            getOptionLabel={(o) => o.nombre}
            value={selectedSubBarrio}
            onChange={handleSubBarrio}
            disabled={disabled || !value.barrioId}
            loading={loadingSub}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sub-barrio"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSub && <CircularProgress size={16} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
      )}

      {/* Calle y referencia */}
      {showDireccionTextual && (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Calle / No."
              value={value.calle ?? ""}
              onChange={(e) => onChange({ ...value, calle: e.target.value })}
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Referencia"
              value={value.referencia ?? ""}
              onChange={(e) =>
                onChange({ ...value, referencia: e.target.value })
              }
              disabled={disabled}
              placeholder="Cerca del parque, color azul..."
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}
