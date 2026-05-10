package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Proyección mínima para listado/modal de búsqueda de factura suplidor. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfFacturaSuplidorResumenDTO {

  private Integer id;
  private LocalDateTime fechaReg;
  private String suplidorNombre;
  private String numeroFactura;
  private String ncf;
  private BigDecimal total;
  private String estadoId;
  private String usuarioReg;
}
