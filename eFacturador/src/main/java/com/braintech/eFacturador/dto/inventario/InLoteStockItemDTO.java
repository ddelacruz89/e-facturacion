package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Un lote (o "sin lote" cuando lote == null) con su stock disponible en un almacén. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InLoteStockItemDTO {
  /** Código de lote. null = producto sin asignación de lote. */
  private String lote;

  private Integer cantidad;
}
