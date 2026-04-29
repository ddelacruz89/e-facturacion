import { createSharedHook } from "./useSharedData";
import { getModulos } from "../apis/ModulosController";
import { ModuloDto } from "../models/seguridad";

export const useSharedModulos = createSharedHook<ModuloDto>(getModulos);
