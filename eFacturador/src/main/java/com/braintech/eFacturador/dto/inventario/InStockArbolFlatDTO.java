package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Proyección plana retornada por JPQL. El servicio la transforma en árbol (producto → almacén →
 * lote).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InStockArbolFlatDTO {

  private Integer productoId;
  private String productoNombre;

  private Integer almacenId;
  private String almacenNombre;

  /** Lote puede ser null cuando el producto no maneja lotes. */
  private String lote;

  private Integer cantidad;
}
