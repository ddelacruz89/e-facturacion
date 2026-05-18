package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Respuesta del endpoint de consulta de stock actual por producto/lote/almacén. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InStockActualDTO {
  private Integer productoId;
  private String productoNombre;
  private Integer almacenId;
  private String lote;
  private Integer cantidad;
}
