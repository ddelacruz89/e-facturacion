// Product module models
import { MgItbis } from "../facturacion";
import { InAlmacen, InSuplidor } from "../inventario";
import { SgMenu } from "../seguridad";
import { MgTag } from "./MgTag";

// ComboBox reference types for form handling
export interface ComboBoxReference {
    id: number;
    name: string;
    description?: string;
}

export interface MgUnidad {
    id?: number; // Changed from string to number to match backend Integer
    nombre: string;
    sigla: string; // Changed from abreviacion to sigla to match backend
    descripcion?: string;
    activo: boolean;
}

// Simple DTO for unidad resumen endpoint
export interface MgUnidadSimpleDTO {
    id: number;
    nombre: string;
}

export interface MgCategoria {
    id?: number;
    secuencia?: string;
    categoria: string;
    modificable: boolean;
    tieneModulo: boolean;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
    activo: boolean;
}

// Simple DTO for categoria resumen endpoint
export interface MgCategoriaSimpleDTO {
    id: number;
    categoria: string;
}

export interface MgProductoUnidadSuplidor {
    // From BaseEntity
    id?: number;
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    // Own properties
    existencia?: number; // Integer -> number
    precioVenta?: number; // BigDecimal -> number
    precioMinimo?: number; // BigDecimal -> number
    disponibleEnCompra?: boolean;
    disponibleEnVenta?: boolean;
    precioCostoAvg?: number; // BigDecimal -> number
    precio: number; // BigDecimal -> number, Required
    cantidad?: number; // Integer -> number
    // Foreign keys
    unidadFraccionId: number; // Foreign key to MgUnidad (ManyToOne, required)
    unidadId: number; // Foreign key to MgUnidad (ManyToOne, required)
    productoId: number; // Foreign key to MgProducto (ManyToOne, required)
    // Relationships
    productosSuplidores?: MgProductoSuplidor[]; // OneToMany
    productosAlmacenesLimites?: MgProductoUnidadSuplidorLimiteAlmacen[]; // OneToMany
}

export interface MgProductoSuplidor {
    // From BaseEntity (but has its own @Id annotation in Java)
    id?: number; // Auto-generated
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    estadoId?: string;
    // Own properties
    precio: number; // BigDecimal -> number, Required
    itbisDefault: boolean; // Indicates if this supplier applies ITBIS by default for this fraction unit
    // Foreign keys
    suplidorId: number; // Foreign key to InSuplidor (ManyToOne, required)
}

export interface MgProductoUnidadSuplidorLimiteAlmacen {
    // From BaseEntity
    id?: number;
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    // Own properties
    limite?: number; // Integer -> number
    almacenId: number; // Foreign key to InAlmacen (ManyToOne)
}

export interface MgProductoModulo {
    id?: number;
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    sgMenuId: number; // Foreign key to SgMenu (ManyToOne)
}

export interface MgProductoTag {
    id?: number;
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    productoId: number; // Foreign key to MgProducto (ManyToOne)
    tagId: number; // Foreign key to MgTag (ManyToOne)
}

export interface MgProducto {
    // From BaseEntity
    id?: number; // Auto-generated
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    // Own properties
    codigoBarra?: string;
    nombreProducto: string; // Required
    descripcion?: string;
    trabajador?: boolean;
    comision?: number; // BigDecimal -> number
    // Foreign keys
    itbisId: number; // Foreign key to MgItbis (ManyToOne, required)
    categoriaId: number; // Foreign key to MgCategoria (ManyToOne, required)
    // Relationships
    unidadProductorSuplidor?: MgProductoUnidadSuplidor[]; // OneToMany (name changed from unidadFraccions)
    productosModulos?: MgProductoModulo[]; // OneToMany
    tags?: MgProductoTag[]; // OneToMany
}

// Form-specific interfaces with ComboBox references
export interface MgProductoFormData extends Omit<MgProducto, "categoriaId" | "itbisId" | "unidadProductorSuplidor"> {
    categoriaId: ComboBoxReference | number;
    itbisId: ComboBoxReference | number;
    unidadProductorSuplidor?: MgProductoUnidadSuplidorFormData[];
}

export interface MgProductoUnidadSuplidorFormData
    extends Omit<MgProductoUnidadSuplidor, "unidadId" | "unidadFraccionId" | "productosSuplidores"> {
    unidadId: ComboBoxReference | number;
    unidadFraccionId: ComboBoxReference | number;
    productosSuplidores?: MgProductoSuplidorFormData[];
}

export interface MgProductoSuplidorFormData extends Omit<MgProductoSuplidor, "suplidorId"> {
    suplidorId: ComboBoxReference | number;
}
