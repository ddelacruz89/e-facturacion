import React, { useCallback } from "react";
import { SearchableComboBox, ComboBoxOption } from "./SearchableComboBox";
import { Control, FieldError } from "react-hook-form";
import { useSharedUnidades } from "../hooks/useSharedUnidades";
import { createSharedHook } from "../hooks/useSharedData";

// Controllers
import { getCategoriasResumen } from "../apis/CategoriaController";
import { getItbisResumen } from "../apis/ItbisController";
import { getSuplidoresResumen } from "../apis/SuplidorController";
import { getAlmacenesActivos } from "../apis/AlmacenController";
import { getMenusAsignablesAProductos } from "../apis/MenuController";
import { getSucursalesActivas } from "../apis/SucursalController";
import { getTagsActivos } from "../apis/TagController";

// Models
import { MgCategoriaSimpleDTO, MgUnidadSimpleDTO } from "../models/producto";
import { MgItbis, MgItbisSimpleDTO } from "../models/facturacion";
import { InAlmacen, InSuplidor, InSuplidorSimpleDTO } from "../models/inventario";
import { SgMenu, SgMenuResumenDTO } from "../models/seguridad";
import { SgSucursal } from "../models/seguridad/SgSucursal";
import { MgTag } from "../models/producto/MgTag";

// Hooks compartidos — una sola llamada al API sin importar cuántas instancias del combo existan
const useSharedCategorias = createSharedHook<MgCategoriaSimpleDTO>(getCategoriasResumen);
const useSharedItbis = createSharedHook<MgItbisSimpleDTO>(getItbisResumen);
const useSharedSuplidores = createSharedHook<InSuplidorSimpleDTO>(getSuplidoresResumen);
const useSharedAlmacenes = createSharedHook<InAlmacen>(getAlmacenesActivos);
const useSharedMenus = createSharedHook<SgMenuResumenDTO>(getMenusAsignablesAProductos);
const useSharedSucursales = createSharedHook<SgSucursal>(getSucursalesActivas);
const useSharedTags = createSharedHook<MgTag>(getTagsActivos);

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
    const { data: categorias, loading, refresh } = useSharedCategorias();

    const options: ComboBoxOption[] = categorias.map((categoria) => ({
        value: categoria.id,
        label: categoria.categoria,
        disabled: false,
        // Se incluye para que onSelectionChange lo reciba y el view detecte si es servicio
        inventario: categoria.inventario,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> =>
            options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            onSearch={handleSearch}
            noOptionsText="No hay categorías disponibles"
            placeholder="Buscar categoría..."
        />
    );
};

// Unidad ComboBox
export const UnidadComboBox: React.FC<BaseComboProps> = ({ label = "Unidad", ...props }) => {
    const { unidades, loading, refresh } = useSharedUnidades();

    const options: ComboBoxOption[] = unidades.map((unidad) => ({
        value: unidad.id,
        label: unidad.nombre,
        disabled: false,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> =>
            options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            onSearch={handleSearch}
            noOptionsText="No hay unidades disponibles"
            placeholder="Buscar unidad..."
        />
    );
};

// ITBIS ComboBox
export const ItbisComboBox: React.FC<BaseComboProps> = ({ label = "ITBIS", ...props }) => {
    const { data: itbisOptions, loading, refresh } = useSharedItbis();

    const options: ComboBoxOption[] = itbisOptions.map((itbis) => ({
        value: itbis.id,
        label: itbis.nombre,
    }));

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            noOptionsText="No hay opciones de ITBIS disponibles"
            placeholder="Buscar ITBIS..."
        />
    );
};

// Almacen ComboBox
export const AlmacenComboBox: React.FC<BaseComboProps> = ({ label = "Almacén", ...props }) => {
    const { data: almacenes, loading, refresh } = useSharedAlmacenes();

    const options: ComboBoxOption[] = almacenes.map((almacen) => ({
        value: almacen.id?.toString() || "",
        label: almacen.nombre,
        description: almacen.sucursalId?.nombre ?? "",
    }));

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            noOptionsText="No hay almacenes disponibles"
            placeholder="Buscar almacén..."
        />
    );
};

// Menu ComboBox
export const MenuComboBox: React.FC<BaseComboProps> = ({ label = "Menú/Módulo", ...props }) => {
    const { data: menus, loading, refresh } = useSharedMenus();

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
            onRefresh={refresh}
            noOptionsText="No hay menús disponibles"
            placeholder="Buscar menú..."
        />
    );
};

// Sucursal ComboBox
export const SucursalComboBox: React.FC<BaseComboProps> = ({ label = "Sucursal", ...props }) => {
    const { data: sucursales, loading, refresh } = useSharedSucursales();

    const options: ComboBoxOption[] = sucursales.map((sucursal) => ({
        value: sucursal.id?.toString() || "",
        label: sucursal.nombre,
        description: `${sucursal.encargado} - ${sucursal.direccion}`,
        disabled: !sucursal.activo,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> =>
            options.filter(
                (o) =>
                    o.label.toLowerCase().includes(query.toLowerCase()) ||
                    o.description?.toLowerCase().includes(query.toLowerCase())
            ),
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            onSearch={handleSearch}
            noOptionsText="No hay sucursales disponibles"
            placeholder="Buscar sucursal..."
        />
    );
};

// Suplidor ComboBox
export const SuplidorComboBox: React.FC<BaseComboProps> = ({ label = "Proveedor", ...props }) => {
    const { data: suplidores, loading, refresh } = useSharedSuplidores();

    const options: ComboBoxOption[] = suplidores.map((suplidor) => ({
        value: suplidor.id,
        label: suplidor.nombre,
        description: `RNC: ${suplidor.rnc || "N/A"} - ID: ${suplidor.id}`,
        disabled: false,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> =>
            options.filter(
                (o) =>
                    o.label.toLowerCase().includes(query.toLowerCase()) ||
                    o.description?.toLowerCase().includes(query.toLowerCase())
            ),
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            onSearch={handleSearch}
            noOptionsText="No hay proveedores disponibles"
            placeholder="Buscar proveedor..."
        />
    );
};

// Tag ComboBox
export const TagComboBox: React.FC<BaseComboProps> = ({ label = "Etiqueta", ...props }) => {
    const { data: tags, loading, refresh } = useSharedTags();

    const options: ComboBoxOption[] = tags.map((tag) => ({
        value: tag.id?.toString() || "",
        label: tag.nombre || `Tag ${tag.id}`,
        disabled: !tag.activo,
    }));

    const handleSearch = useCallback(
        async (query: string): Promise<ComboBoxOption[]> =>
            options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
        [options]
    );

    return (
        <SearchableComboBox
            {...props}
            label={label}
            options={options}
            loading={loading}
            onRefresh={refresh}
            onSearch={handleSearch}
            noOptionsText="No hay etiquetas disponibles"
            placeholder="Buscar etiqueta..."
        />
    );
};
