import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ActionBar from "../../customers/ActionBar";
import {
  getBarriosByMunicipio,
  getMunicipiosByProvincia,
  getProvincias,
  getSubBarriosByBarrio,
  MgBarrioParajeResumen,
  MgMunicipioResumen,
  MgProvincia,
  MgSubBarrioResumen,
} from "../../apis/UbicacionController";
import {
  deletePrecioBarrio,
  deletePrecioSubBarrio,
  DePrecioEnvioDTO,
  getPreciosPorMunicipio,
  upsertPrecioBarrio,
  upsertPrecioSubBarrio,
} from "../../apis/DePrecioEnvioController";

// ── tipos internos ────────────────────────────────────────────────────────────

interface BarrioRow extends MgBarrioParajeResumen {
  precioActual: number | null;
}

interface SubBarrioRow extends MgSubBarrioResumen {
  precioActual: number | null;
  precioBarrioPadre: number | null;
}

const HEADER_BG = "#272C36";
const CELL_SX = { py: 0.8 };

// ── PrecioInput — estado local, nunca sube al padre al tipear ────────────────

const PrecioInput = React.memo(function PrecioInput({
  initialValue,
  onGuardar,
  onEliminar,
}: {
  initialValue: number | null;
  onGuardar: (precio: number) => Promise<void>;
  onEliminar?: () => Promise<void>;
}) {
  const [valor, setValor] = useState(initialValue != null ? String(initialValue) : "");
  const [saving, setSaving] = useState(false);

  // Sincroniza cuando el padre confirma el guardado
  useEffect(() => {
    setValor(initialValue != null ? String(initialValue) : "");
  }, [initialValue]);

  const handleGuardar = async () => {
    const val = parseFloat(valor);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    try {
      await onGuardar(val);
    } catch {
      // El padre muestra el mensaje de error vía showMsg
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!onEliminar) return;
    setSaving(true);
    try {
      await onEliminar();
    } catch {
      // El padre muestra el mensaje de error vía showMsg
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <TextField
        size="small"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
        inputProps={{ style: { width: 90 }, type: "number", min: 0, step: "0.01" }}
        InputProps={{
          startAdornment: <InputAdornment position="start">RD$</InputAdornment>,
        }}
        sx={{ "& .MuiInputBase-root": { fontSize: "0.85rem" } }}
      />
      <Tooltip title="Guardar">
        <span>
          <IconButton
            size="small"
            color="primary"
            onClick={handleGuardar}
            disabled={saving || valor.trim() === ""}
          >
            {saving ? <CircularProgress size={16} /> : <SaveOutlinedIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      {initialValue != null && onEliminar && (
        <Tooltip title="Eliminar precio">
          <IconButton size="small" color="error" onClick={handleEliminar} disabled={saving}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

// ── componente principal ──────────────────────────────────────────────────────

const DePrecioEnvioView: React.FC = () => {
  const [provincias, setProvincias] = useState<MgProvincia[]>([]);
  const [municipios, setMunicipios] = useState<MgMunicipioResumen[]>([]);
  const [barrios, setBarrios] = useState<BarrioRow[]>([]);
  const [loadingMun, setLoadingMun] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);

  const [selectedProv, setSelectedProv] = useState<MgProvincia | null>(null);
  const [selectedMun, setSelectedMun] = useState<MgMunicipioResumen | null>(null);

  // Precios cargados una sola vez por municipio — se reutilizan al expandir sub-barrios
  const [preciosTodos, setPreciosTodos] = useState<DePrecioEnvioDTO[]>([]);

  const [subBarriosPorBarrio, setSubBarriosPorBarrio] = useState<Record<number, SubBarrioRow[]>>({});
  const [expandedBarrios, setExpandedBarrios] = useState<Record<number, boolean>>({});
  const [loadingSubBarrios, setLoadingSubBarrios] = useState<Record<number, boolean>>({});

  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });
  const showMsg = useCallback(
    (msg: string, sev: "success" | "error" = "success") =>
      setSnack({ open: true, msg, sev }),
    []
  );

  // Carga provincias una vez
  useEffect(() => {
    getProvincias().then(setProvincias).catch(console.error);
  }, []);

  // Carga municipios al cambiar provincia
  useEffect(() => {
    if (!selectedProv) { setMunicipios([]); return; }
    setLoadingMun(true);
    setSelectedMun(null);
    setBarrios([]);
    getMunicipiosByProvincia(selectedProv.codProvincia)
      .then(setMunicipios)
      .catch(console.error)
      .finally(() => setLoadingMun(false));
  }, [selectedProv]);

  const cargarBarrios = useCallback(async (mun: MgMunicipioResumen) => {
    setLoadingBarrios(true);
    setExpandedBarrios({});
    setSubBarriosPorBarrio({});
    setPreciosTodos([]);
    try {
      const [todosBarrios, precios] = await Promise.all([
        getBarriosByMunicipio(mun.id),
        getPreciosPorMunicipio(mun.id),
      ]);
      setPreciosTodos(precios);
      const precioBarrioMap = new Map(
        precios.filter((p) => p.subBarrioId === null).map((p) => [p.barrioId, p.precio])
      );
      setBarrios(
        todosBarrios.map((b) => ({
          ...b,
          precioActual: precioBarrioMap.get(b.id) ?? null,
        }))
      );
    } catch {
      showMsg("Error cargando barrios.", "error");
    } finally {
      setLoadingBarrios(false);
    }
  }, [showMsg]);

  useEffect(() => {
    if (!selectedMun) { setBarrios([]); return; }
    cargarBarrios(selectedMun);
  }, [selectedMun, cargarBarrios]);

  // ── expandir sub-barrios (reutiliza preciosTodos, sin llamada extra) ─────────

  const toggleSubBarrios = useCallback(async (barrioId: number, barrioPrice: number | null) => {
    const nuevoEstado = !expandedBarrios[barrioId];
    setExpandedBarrios((prev) => ({ ...prev, [barrioId]: nuevoEstado }));

    if (!subBarriosPorBarrio[barrioId] && nuevoEstado) {
      setLoadingSubBarrios((prev) => ({ ...prev, [barrioId]: true }));
      try {
        const subs = await getSubBarriosByBarrio(barrioId);
        const precioSubMap = new Map(
          preciosTodos
            .filter((p) => p.subBarrioId !== null && p.barrioId === barrioId)
            .map((p) => [p.subBarrioId!, p.precio])
        );
        setSubBarriosPorBarrio((prev) => ({
          ...prev,
          [barrioId]: subs.map((s) => ({
            ...s,
            precioActual: precioSubMap.get(s.id) ?? null,
            precioBarrioPadre: barrioPrice,
          })),
        }));
      } catch {
        showMsg("Error cargando sub-barrios.", "error");
      } finally {
        setLoadingSubBarrios((prev) => ({ ...prev, [barrioId]: false }));
      }
    }
  }, [expandedBarrios, subBarriosPorBarrio, preciosTodos, showMsg]);

  // ── handlers barrio ──────────────────────────────────────────────────────────

  const handleGuardarBarrio = useCallback(
    async (barrioId: number, nombre: string, precio: number) => {
      try {
        const dto = await upsertPrecioBarrio(barrioId, precio);
        setBarrios((prev) =>
          prev.map((b) => (b.id === barrioId ? { ...b, precioActual: dto.precio } : b))
        );
        setPreciosTodos((prev) => [
          ...prev.filter((p) => !(p.barrioId === barrioId && p.subBarrioId === null)),
          dto,
        ]);
        showMsg(`Precio de "${nombre}" guardado.`);
      } catch (e: any) {
        showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        throw e; // re-throw para que PrecioInput sepa que falló
      }
    },
    [showMsg]
  );

  const handleEliminarBarrio = useCallback(
    async (barrioId: number, nombre: string) => {
      if (!window.confirm(`¿Eliminar el precio de "${nombre}"?`)) return;
      try {
        await deletePrecioBarrio(barrioId);
        setBarrios((prev) =>
          prev.map((b) => (b.id === barrioId ? { ...b, precioActual: null } : b))
        );
        setPreciosTodos((prev) =>
          prev.filter((p) => !(p.barrioId === barrioId && p.subBarrioId === null))
        );
        showMsg(`Precio de "${nombre}" eliminado.`);
      } catch (e: any) {
        showMsg(e?.response?.data?.message ?? "Error al eliminar.", "error");
        throw e;
      }
    },
    [showMsg]
  );

  // ── handlers sub-barrio ──────────────────────────────────────────────────────

  const handleGuardarSubBarrio = useCallback(
    async (subBarrioId: number, barrioId: number, nombre: string, precio: number) => {
      try {
        const dto = await upsertPrecioSubBarrio(subBarrioId, precio);
        setSubBarriosPorBarrio((prev) => ({
          ...prev,
          [barrioId]: (prev[barrioId] ?? []).map((s) =>
            s.id === subBarrioId ? { ...s, precioActual: dto.precio } : s
          ),
        }));
        setPreciosTodos((prev) => [
          ...prev.filter((p) => p.subBarrioId !== subBarrioId),
          dto,
        ]);
        showMsg(`Precio de "${nombre}" guardado.`);
      } catch (e: any) {
        showMsg(e?.response?.data?.message ?? "Error al guardar.", "error");
        throw e;
      }
    },
    [showMsg]
  );

  const handleEliminarSubBarrio = useCallback(
    async (subBarrioId: number, barrioId: number, nombre: string) => {
      if (!window.confirm(`¿Eliminar el precio específico de "${nombre}"?`)) return;
      try {
        await deletePrecioSubBarrio(subBarrioId);
        setSubBarriosPorBarrio((prev) => ({
          ...prev,
          [barrioId]: (prev[barrioId] ?? []).map((s) =>
            s.id === subBarrioId ? { ...s, precioActual: null } : s
          ),
        }));
        setPreciosTodos((prev) => prev.filter((p) => p.subBarrioId !== subBarrioId));
        showMsg(`Precio de "${nombre}" eliminado.`);
      } catch (e: any) {
        showMsg(e?.response?.data?.message ?? "Error al eliminar.", "error");
        throw e;
      }
    },
    [showMsg]
  );

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ flexGrow: 1 }}>
      <ActionBar title="Precios de Envío por Zona" />

      <Box sx={{ p: 2 }}>
        {/* Selectores */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Seleccionar zona
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              select
              label="Provincia"
              size="small"
              value={selectedProv?.codProvincia ?? ""}
              onChange={(e) =>
                setSelectedProv(provincias.find((p) => p.codProvincia === e.target.value) ?? null)
              }
              sx={{ minWidth: 220 }}
              SelectProps={{ native: true }}
            >
              <option value="" />
              {provincias.map((p) => (
                <option key={p.codProvincia} value={p.codProvincia}>
                  {p.nombre}
                </option>
              ))}
            </TextField>

            <TextField
              select
              label="Municipio / DM"
              size="small"
              value={selectedMun?.id ?? ""}
              onChange={(e) =>
                setSelectedMun(municipios.find((m) => m.id === Number(e.target.value)) ?? null)
              }
              disabled={!selectedProv || loadingMun}
              sx={{ minWidth: 260 }}
              SelectProps={{ native: true }}
              InputProps={{
                endAdornment: loadingMun ? <CircularProgress size={14} sx={{ mr: 1 }} /> : undefined,
              }}
            >
              <option value="" />
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}{m.esDm ? " (DM)" : ""}
                </option>
              ))}
            </TextField>
          </Box>
        </Paper>

        {/* Tabla de barrios */}
        {selectedMun && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: HEADER_BG }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", width: "36px" }} />
                  <TableCell sx={{ color: "#fff" }}>Barrio / Paraje</TableCell>
                  <TableCell sx={{ color: "#fff", width: "150px" }}>Precio base</TableCell>
                  <TableCell sx={{ color: "#fff", width: "220px" }}>Configurar precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingBarrios ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : barrios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: "#888", py: 3 }}>
                      No hay barrios para este municipio.
                    </TableCell>
                  </TableRow>
                ) : (
                  barrios.map((barrio) => (
                    <React.Fragment key={barrio.id}>
                      <TableRow hover>
                        <TableCell sx={CELL_SX}>
                          <IconButton
                            size="small"
                            onClick={() => toggleSubBarrios(barrio.id, barrio.precioActual)}
                          >
                            {loadingSubBarrios[barrio.id] ? (
                              <CircularProgress size={16} />
                            ) : expandedBarrios[barrio.id] ? (
                              <ExpandLessIcon fontSize="small" />
                            ) : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={CELL_SX}>
                          <Typography variant="body2" fontWeight={500}>
                            {barrio.nombre}
                          </Typography>
                        </TableCell>
                        <TableCell sx={CELL_SX}>
                          {barrio.precioActual != null ? (
                            <Chip
                              label={`RD$${Number(barrio.precioActual).toFixed(2)}`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sin precio
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={CELL_SX}>
                          <PrecioInput
                            initialValue={barrio.precioActual}
                            onGuardar={(precio) =>
                              handleGuardarBarrio(barrio.id, barrio.nombre, precio)
                            }
                            onEliminar={
                              barrio.precioActual != null
                                ? () => handleEliminarBarrio(barrio.id, barrio.nombre)
                                : undefined
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Sub-barrios expandibles */}
                      {expandedBarrios[barrio.id] && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                            <Collapse in={expandedBarrios[barrio.id]} unmountOnExit>
                              <Table size="small" sx={{ backgroundColor: "#f9fafb" }}>
                                <TableBody>
                                  {(subBarriosPorBarrio[barrio.id] ?? []).length === 0 ? (
                                    <TableRow>
                                      <TableCell
                                        colSpan={4}
                                        sx={{ pl: 6, color: "#aaa", fontSize: "0.8rem", py: 1 }}
                                      >
                                        Este barrio no tiene sub-barrios registrados.
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    (subBarriosPorBarrio[barrio.id] ?? []).map((sub) => (
                                      <TableRow key={sub.id} hover>
                                        <TableCell sx={{ ...CELL_SX, width: "36px" }} />
                                        <TableCell sx={{ ...CELL_SX, pl: 5 }}>
                                          <Typography variant="body2" color="text.secondary">
                                            ↳ {sub.nombre}
                                          </Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...CELL_SX, width: "150px" }}>
                                          {sub.precioActual != null ? (
                                            <Chip
                                              label={`RD$${Number(sub.precioActual).toFixed(2)}`}
                                              size="small"
                                              color="info"
                                              variant="outlined"
                                            />
                                          ) : (
                                            <Typography variant="caption" color="text.secondary">
                                              {sub.precioBarrioPadre != null
                                                ? `Hereda RD$${Number(sub.precioBarrioPadre).toFixed(2)}`
                                                : "Sin precio"}
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell sx={{ ...CELL_SX, width: "220px" }}>
                                          <PrecioInput
                                            initialValue={sub.precioActual}
                                            onGuardar={(precio) =>
                                              handleGuardarSubBarrio(
                                                sub.id,
                                                barrio.id,
                                                sub.nombre,
                                                precio
                                              )
                                            }
                                            onEliminar={
                                              sub.precioActual != null
                                                ? () =>
                                                    handleEliminarSubBarrio(
                                                      sub.id,
                                                      barrio.id,
                                                      sub.nombre
                                                    )
                                                : undefined
                                            }
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!selectedMun && !loadingBarrios && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Selecciona una provincia y un municipio para ver los barrios.
            </Typography>
          </Paper>
        )}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DePrecioEnvioView;
