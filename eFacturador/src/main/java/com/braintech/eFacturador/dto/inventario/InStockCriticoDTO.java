package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Proyección plana de un producto que está por debajo de su límite mínimo de stock. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InStockCriticoDTO {

  private Integer productoId;
  private String productoNombre;
  private Integer almacenId;
  private String almacenNombre;
  private Integer cantidadActual;
  private Integer limite;

  /**
   * Diferencia entre límite y cantidad actual (siempre positivo: faltante para alcanzar el límite).
   */
  private Integer faltante;
}
