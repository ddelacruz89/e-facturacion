package com.braintech.eFacturador.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MgCategoriaSimpleDTO {
  private Integer id;
  private String categoria;

  /** true = Producto (maneja inventario), false = Servicio (sin inventario) */
  private Boolean inventario;
}
