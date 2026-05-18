package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Descuento de un renglón de factura suplidor. tipo = '$' → monto fijo; tipo = '%' → porcentaje del
 * monto del ítem.
 */
@Data
@NoArgsConstructor
public class MfFacturaSuplidorDetalleDescuentoRequestDTO {

  private Integer id;

  /** '$' = monto fijo | '%' = porcentaje */
  private String tipo;

  /** Si tipo='%': el porcentaje ingresado. Si tipo='$': el monto directo. */
  private BigDecimal valor;

  /** Monto RD$ calculado que se descuenta del renglón. */
  private BigDecimal monto;
}
