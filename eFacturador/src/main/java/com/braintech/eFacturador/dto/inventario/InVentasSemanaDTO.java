package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InVentasSemanaDTO {
  private Integer semana;
  private Integer anio;
  private Long unidades;
  private BigDecimal costoTotal;
}
