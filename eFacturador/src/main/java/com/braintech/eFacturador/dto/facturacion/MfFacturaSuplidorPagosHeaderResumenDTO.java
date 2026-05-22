package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfFacturaSuplidorPagosHeaderResumenDTO {
  private Integer id;
  private LocalDateTime fechaPago;
  private Integer facturaSuplidorId;
  private String suplidorNombre;
  private BigDecimal monto;
  private BigDecimal pagado;
  private String usuarioReg;
  private String estadoId;
}
