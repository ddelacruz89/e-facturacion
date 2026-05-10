package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Nodo nivel 3 del árbol de stock: lote con su cantidad en un almacén. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InStockLoteNodoDTO {

  /** Identificador del lote. Null cuando el producto no maneja lotes. */
  private String lote;

  /** Cantidad disponible de este lote en el almacén padre. */
  private Integer cantidad;
}
