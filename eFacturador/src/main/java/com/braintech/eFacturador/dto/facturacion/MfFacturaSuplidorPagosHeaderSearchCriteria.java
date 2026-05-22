package com.braintech.eFacturador.dto.facturacion;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MfFacturaSuplidorPagosHeaderSearchCriteria {
  private Integer facturaSuplidorId;
  private String estadoId;
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
}
