package com.braintech.eFacturador.dto.producto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MgProductoCompraDTO {
  private Integer id;
  private String nombreProducto;
  private BigDecimal precio;
  private BigDecimal itbis;
  private MgProductoUnidadSuplidorCompraDTO unidadSuplidor;
}
