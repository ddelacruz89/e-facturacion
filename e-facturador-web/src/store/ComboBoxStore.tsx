import { create } from "zustand";
import { TipoFactura, TipoComprobante, MgRetencion } from "../models/facturacion";

type ComboBox = {
    tipoFacturas: TipoFactura[];
    tipoComprobantes: TipoComprobante[];
    retenciones: MgRetencion[];
    setTipoFacturas: (newTipoFacturas: TipoFactura[]) => void;
    setTipoComprobantes: (newTipoComprobantes: TipoComprobante[]) => void;
    setRetenciones: (newRetenciones: MgRetencion[]) => void;
}


export const comboBoxStore = create<ComboBox>((set) => ({
    tipoFacturas: [],
    tipoComprobantes: [],
    retenciones: [],
    setTipoFacturas: (newTipoFacturas: TipoFactura[]) => set({ tipoFacturas: newTipoFacturas }),
    setTipoComprobantes: (newTipoComprobantes: TipoComprobante[]) => set({ tipoComprobantes: newTipoComprobantes }),
    setRetenciones: (newRetenciones: MgRetencion[]) => set({ retenciones: newRetenciones }),
}));
