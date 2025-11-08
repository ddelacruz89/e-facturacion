import React, { useState, useCallback, useEffect } from "react";
import { SearchableComboBox, ComboBoxOption } from "./SearchableComboBox";
import { Control, FieldError } from "react-hook-form";

// Controllers
import { getCategorias } from "../apis/CategoriaController";
import { getUnidades } from "../apis/UnidadController";
import { getItbisOptions } from "../apis/ItbisController";
import { getAlmacenesActivos } from "../apis/AlmacenController";
import { getMenusActivos } from "../apis/MenuController";

// Models
import { MgCategoria, MgUnidad } from "../models/producto";
import { MgItbis } from "../models/facturacion";
import { InAlmacen } from "../models/inventario";
import { SgMenu } from "../models/seguridad";

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
    const [categorias, setCategorias] = useState<MgCategoria[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCategorias = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategorias();
            setCategorias(data);
            console.log("Categorias loaded:", data);
        } catch (error) {
            console.error("Error loading categorias:", error);
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategorias();
    }, [loadCategorias]);

    const options: ComboBoxOption[] = categorias.map((categoria) => ({
        value: categoria.secuencia || 0,
        label: categoria.categoria,
        description: `ID: ${categoria.secuencia} ${categoria.modificable ? "- Modificable" : ""}`,
        disabled: false, // No activo field in model
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
    const [unidades, setUnidades] = useState<MgUnidad[]>([]);
    const [loading, setLoading] = useState(false);

    const loadUnidades = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUnidades();
            setUnidades(data);
        } catch (error) {
            console.error("Error loading unidades:", error);
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
        label: `${unidad.nombre} (${unidad.abreviacion})`,
        description: unidad.descripcion || `ID: ${unidad.id}`,
        disabled: !unidad.activo,
    }));

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={loadUnidades}
            noOptionsText="No hay unidades disponibles"
            placeholder="Buscar unidad..."
        />
    );
};

// ITBIS ComboBox
export const ItbisComboBox: React.FC<BaseComboProps> = ({ label = "ITBIS", ...props }) => {
    const [itbisOptions, setItbisOptions] = useState<MgItbis[]>([]);
    const [loading, setLoading] = useState(false);

    const loadItbis = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getItbisOptions();
            setItbisOptions(data);
        } catch (error) {
            console.error("Error loading ITBIS:", error);
            setItbisOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItbis();
    }, [loadItbis]);

    const options: ComboBoxOption[] = itbisOptions.map((itbis) => ({
        value: itbis.id?.toString() || "",
        label: `${itbis.nombre} (${itbis.itbis}%)`,
        description: `Tasa: ${itbis.itbis}%`,
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
    const [menus, setMenus] = useState<SgMenu[]>([]);
    const [loading, setLoading] = useState(false);

    const loadMenus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMenusActivos();
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
        label: menu.nombre,
        description: menu.descripcion || `ID: ${menu.id}`,
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
