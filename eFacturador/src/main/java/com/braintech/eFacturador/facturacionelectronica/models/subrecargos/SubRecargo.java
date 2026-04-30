package com.braintech.eFacturador.facturacionelectronica.models.subrecargos;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SubRecargo {
  private String tipoSubRecargo;
  private BigDecimal subRecargoPorcentaje;
  private BigDecimal montoSubRecargo;
}
