package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InSuplidorProductoResumenDTO {

  private Integer id; // mg_producto_suplidor.id
  private Integer productoId;
  private String productoNombre;
  private BigDecimal precio;
  private String estadoId;
}
