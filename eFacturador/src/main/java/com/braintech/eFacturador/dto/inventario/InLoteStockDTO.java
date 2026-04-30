package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Stock de un lote en un almacén específico. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InLoteStockDTO {
  private Integer almacenId;
  private String almacenNombre;
  private Double cantidad;
}
