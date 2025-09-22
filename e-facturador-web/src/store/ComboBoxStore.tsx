import { create } from "zustand";
import { TipoFactura, TipoComprobante } from "../models/facturacion";

type ComboBox = {
    tipoFacturas: TipoFactura[];
    tipoComprobantes: TipoComprobante[];
    setTipoFacturas: (newTipoFacturas: TipoFactura[]) => void;
    setTipoComprobantes: (newTipoComprobantes: TipoComprobante[]) => void;
}


export const comboBoxStore = create<ComboBox>((set) => ({
    tipoFacturas: [],
    tipoComprobantes: [],
    setTipoFacturas: (newTipoFacturas: TipoFactura[]) => set({ tipoFacturas: newTipoFacturas }),
    setTipoComprobantes: (newTipoComprobantes: TipoComprobante[]) => set({ tipoComprobantes: newTipoComprobantes }),
}));
