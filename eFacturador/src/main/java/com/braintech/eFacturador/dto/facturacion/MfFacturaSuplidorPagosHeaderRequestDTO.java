package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MfFacturaSuplidorPagosHeaderRequestDTO {
  private Integer facturaSuplidorId;
  private BigDecimal monto;
  private BigDecimal pagado;
  private LocalDateTime fechaPago;
  private String estadoId;
  private Integer contableId;
  private List<MfFacturaSuplidorPagosDetalleRequestDTO> detalles;
}
