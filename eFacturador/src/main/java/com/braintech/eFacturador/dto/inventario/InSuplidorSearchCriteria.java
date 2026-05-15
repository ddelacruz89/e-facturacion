package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InSuplidorSearchCriteria {

  private String nombre;
  private String rnc;

  /** ID del tipo de comprobante (ECF). Enviar "" para no filtrar. */
  private String tipoComprobanteId;

  private Integer page = 0;
  private Integer size = 10;
}
