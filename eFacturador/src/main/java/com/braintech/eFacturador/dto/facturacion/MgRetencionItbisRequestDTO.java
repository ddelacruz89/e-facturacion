package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Payload para crear o actualizar una retención. */
@Data
@NoArgsConstructor
public class MgRetencionItbisRequestDTO {

  private String descripcion;

  /** Porcentaje de retención (ej. 30 = 30%). */
  private BigDecimal valor;

  /** ID de la cuenta contable que retiene. */
  private Integer retenerCuentaId;

  /** ID de la cuenta contable del retenido. */
  private Integer retenidoCuentaId;

  private String comentarioFactura;

  /** true → sobre el total; false → solo sobre el ITBIS. */
  private Boolean alTotal;

  /** "ITBIS" o "ISR". */
  private String tipoRetencion;
}
