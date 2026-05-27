package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InVentasComparativoDTO {
  private Integer mes;
  private Long unidadesActual;
  private Long unidadesAnterior;
  private BigDecimal costoActual;
  private BigDecimal costoAnterior;
}
