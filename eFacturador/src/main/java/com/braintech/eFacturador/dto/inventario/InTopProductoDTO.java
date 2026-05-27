package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InTopProductoDTO {
  private Integer productoId;
  private String productoNombre;
  private Long unidades;
  private BigDecimal costoTotal;
}
