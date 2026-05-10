package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Proyección mínima para listados y dropdowns. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MgRetencionItbisResumenDTO {

  private Integer id;
  private String descripcion;
  private BigDecimal valor;
  private Boolean alTotal;
  private String tipoRetencion;
  private String comentarioFactura;
}
