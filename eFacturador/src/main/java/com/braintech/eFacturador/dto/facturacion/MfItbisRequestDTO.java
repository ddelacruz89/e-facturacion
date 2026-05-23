package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MfItbisRequestDTO {

  private String nombre;
  private BigDecimal itbis;
  private String cuentaContable;
  private Integer mgItbisId;
}
