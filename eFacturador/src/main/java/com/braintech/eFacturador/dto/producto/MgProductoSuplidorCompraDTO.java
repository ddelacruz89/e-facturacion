package com.braintech.eFacturador.dto.producto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MgProductoSuplidorCompraDTO {
  private Integer id;
  private BigDecimal precio;
  private Boolean itbisDefault;
  private String estadoId;
}
