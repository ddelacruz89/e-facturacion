package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfFacturaParaDespachoDTO {
  private Integer id;
  private Integer secuencia;
  private String razonSocial;
  private Integer clienteId;
  private BigDecimal total;
  private LocalDateTime fechaReg;
}
