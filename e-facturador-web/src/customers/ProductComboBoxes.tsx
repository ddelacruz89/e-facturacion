import React, { useState, useCallback, useEffect } from "react";
import { SearchableComboBox, ComboBoxOption } from "./SearchableComboBox";
import { Control, FieldError } from "react-hook-form";

// Controllers
import { getCategoriasResumen } from "../apis/CategoriaController";
import { getUnidadesResumen } from "../apis/UnidadController";
import { getItbisResumen } from "../apis/ItbisController";
import { getSuplidoresResumen } from "../apis/SuplidorController";
import { getAlmacenesActivos } from "../apis/AlmacenController";
import { getMenusActivos, getMenusAsignablesAProductos } from "../apis/MenuController";
import { getSucursalesActivas } from "../apis/SucursalController";
// Remove getSuplidoresActivos import since we're using the shared hook
import { getTagsActivos } from "../apis/TagController";

// Models
import { MgCategoria, MgUnidad, MgCategoriaSimpleDTO, MgUnidadSimpleDTO } from "../models/producto";
import { MgItbis, MgItbisSimpleDTO } from "../models/facturacion";
import { InAlmacen, InSuplidor, InSuplidorSimpleDTO } from "../models/inventario";
import { SgMenu, SgMenuResumenDTO } from "../models/seguridad";
import { SgSucursal } from "../models/seguridad/SgSucursal";
import { MgTag } from "../models/producto/MgTag";

interface BaseComboProps {
    name: string;
    label?: string;
    control: Control<any>;
    error?: FieldError;
    rules?: object;
    size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    disabled?: boolean;
    multiple?: boolean;
    onSelectionChange?: (value: any) => void;
}

// Categoria ComboBox
export const CategoriaComboBox: React.FC<BaseComboProps> = ({ label = "Categoría", ...props }) => {
    const [categorias, setCategorias] = useState<MgCategoriaSimpleDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCategorias = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategoriasResumen();
            setCategorias(data);
        } catch (error) {
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategorias();
    }, [loadCategorias]);

    const options: ComboBoxOption[] = categorias.map((categoria) => ({
        value: categoria.id,
        label: categoria.categoria,
        // description: `ID: ${categoria.id}`,
        disabled: false,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> => {
            // For now, just filter locally, but you could implement server-side search
            return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
        },
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadCategorias}
            onSearch={handleSearch}
            noOptionsText="No hay categorías disponibles"
            placeholder="Buscar categoría..."
        />
    );
};

// Unidad ComboBox
export const UnidadComboBox: React.FC<BaseComboProps> = ({ label = "Unidad", ...props }) => {
    const [unidades, setUnidades] = useState<MgUnidadSimpleDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadUnidades = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUnidadesResumen();
            setUnidades(data);
            console.log("Unidades resumen loaded:", data);
        } catch (error) {
            console.error("Error loading unidades resumen:", error);
            setUnidades([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUnidades();
    }, [loadUnidades]);

    const options: ComboBoxOption[] = unidades.map((unidad) => ({
        value: unidad.id,
        label: unidad.nombre,
        description: `ID: ${unidad.id}`,
        disabled: false,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> => {
            return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
        },
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadUnidades}
            onSearch={handleSearch}
            noOptionsText="No hay unidades disponibles"
            placeholder="Buscar unidad..."
        />
    );
};

// ITBIS ComboBox
export const ItbisComboBox: React.FC<BaseComboProps> = ({ label = "ITBIS", ...props }) => {
    const [itbisOptions, setItbisOptions] = useState<MgItbisSimpleDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadItbis = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getItbisResumen();
            setItbisOptions(data);
            console.log("ITBIS resumen loaded:", data);
        } catch (error) {
            console.error("Error loading ITBIS resumen:", error);
            setItbisOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItbis();
    }, [loadItbis]);

    const options: ComboBoxOption[] = itbisOptions.map((itbis) => ({
        value: itbis.id,
        label: itbis.nombre,
        description: `ID: ${itbis.id}`,
    }));

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadItbis}
            noOptionsText="No hay opciones de ITBIS disponibles"
            placeholder="Buscar ITBIS..."
        />
    );
};

// Almacen ComboBox
export const AlmacenComboBox: React.FC<BaseComboProps> = ({ label = "Almacén", ...props }) => {
    const [almacenes, setAlmacenes] = useState<InAlmacen[]>([]);
    const [loading, setLoading] = useState(false);

    const loadAlmacenes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAlmacenesActivos();
            setAlmacenes(data);
        } catch (error) {
            console.error("Error loading almacenes:", error);
            setAlmacenes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAlmacenes();
    }, [loadAlmacenes]);

    const options: ComboBoxOption[] = almacenes.map((almacen) => ({
        value: almacen.id?.toString() || "",
        label: almacen.nombre,
        description: `ID: ${almacen.id}`,
    }));

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadAlmacenes}
            noOptionsText="No hay almacenes disponibles"
            placeholder="Buscar almacén..."
        />
    );
};

// Menu ComboBox
export const MenuComboBox: React.FC<BaseComboProps> = ({ label = "Menú/Módulo", ...props }) => {
    const [menus, setMenus] = useState<SgMenuResumenDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadMenus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMenusAsignablesAProductos();
            setMenus(data);
        } catch (error) {
            console.error("Error loading menus:", error);
            setMenus([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMenus();
    }, [loadMenus]);

    const options: ComboBoxOption[] = menus.map((menu) => ({
        value: menu.id?.toString() || "",
        label: menu.menu,
        description: menu.menu || `ID: ${menu.id}`,
    }));

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadMenus}
            noOptionsText="No hay menús disponibles"
            placeholder="Buscar menú..."
        />
    );
};

// Sucursal ComboBox
export const SucursalComboBox: React.FC<BaseComboProps> = ({ label = "Sucursal", ...props }) => {
    const [sucursales, setSucursales] = useState<SgSucursal[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSucursales = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSucursalesActivas();
            setSucursales(data);
        } catch (error) {
            console.error("Error loading sucursales:", error);
            setSucursales([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSucursales();
    }, [loadSucursales]);

    const options: ComboBoxOption[] = sucursales.map((sucursal) => ({
        value: sucursal.id?.toString() || "",
        label: sucursal.nombre,
        description: `${sucursal.encargado} - ${sucursal.direccion}`,
        disabled: !sucursal.activo,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> => {
            return options.filter(
                (option) =>
                    option.label.toLowerCase().includes(query.toLowerCase()) ||
                    option.description?.toLowerCase().includes(query.toLowerCase())
            );
        },
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadSucursales}
            onSearch={handleSearch}
            noOptionsText="No hay sucursales disponibles"
            placeholder="Buscar sucursal..."
        />
    );
};

// Suplidor ComboBox
export const SuplidorComboBox: React.FC<BaseComboProps> = ({ label = "Proveedor", ...props }) => {
    const [suplidores, setSuplidores] = useState<InSuplidorSimpleDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSuplidores = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSuplidoresResumen();
            setSuplidores(data);
            console.log("Suplidores resumen loaded:", data);
        } catch (error) {
            console.error("Error loading suplidores resumen:", error);
            setSuplidores([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSuplidores();
    }, [loadSuplidores]);

    const options: ComboBoxOption[] = suplidores.map((suplidor) => ({
        value: suplidor.id,
        label: suplidor.nombre,
        description: `RNC: ${suplidor.rnc || "N/A"} - ID: ${suplidor.id}`,
        disabled: false,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> => {
            return options.filter(
                (option) =>
                    option.label.toLowerCase().includes(query.toLowerCase()) ||
                    option.description?.toLowerCase().includes(query.toLowerCase())
            );
        },
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadSuplidores}
            onSearch={handleSearch}
            noOptionsText="No hay proveedores disponibles"
            placeholder="Buscar proveedor..."
        />
    );
};

// Tag ComboBox
export const TagComboBox: React.FC<BaseComboProps> = ({ label = "Etiqueta", ...props }) => {
    const [tags, setTags] = useState<MgTag[]>([]);
    const [loading, setLoading] = useState(false);

    const loadTags = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTagsActivos();
            setTags(data);
        } catch (error) {
            console.error("Error loading tags:", error);
            setTags([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

    const options: ComboBoxOption[] = tags.map((tag) => ({
        value: tag.id?.toString() || "",
        label: tag.nombre || `Tag ${tag.id}`,
        description: `ID: ${tag.id}`,
        disabled: !tag.activo,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> => {
            return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
        },
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadTags}
            onSearch={handleSearch}
            noOptionsText="No hay etiquetas disponibles"
            placeholder="Buscar etiqueta..."
        />
    );
};
