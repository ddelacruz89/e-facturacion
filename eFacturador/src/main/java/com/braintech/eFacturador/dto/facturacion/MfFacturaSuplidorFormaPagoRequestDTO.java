package com.braintech.eFacturador.dto.facturacion;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MfFacturaSuplidorFormaPagoRequestDTO {
  private String formaPago;
  private String estadoId;
  private String tipoFormaPago;
  private Integer catalogosCuentasId;
}
