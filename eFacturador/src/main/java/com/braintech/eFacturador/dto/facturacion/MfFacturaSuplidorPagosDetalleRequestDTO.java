package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MfFacturaSuplidorPagosDetalleRequestDTO {
  private String numeroReferencia;
  private Integer formaPagoId;
  private BigDecimal montoPagado;
  private LocalDateTime fechaPago;
  private String concepto;
  private Integer tipoPago;
  private String estado;
}
