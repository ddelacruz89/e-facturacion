package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Payload de un renglón de la factura suplidor. */
@Data
@NoArgsConstructor
public class MfFacturaSuplidorDetalleRequestDTO {

  private Integer id;

  private Integer cantidad;
  private BigDecimal precioUnitario;
  private BigDecimal montoItem;
  private String concepto;
  private BigDecimal subtotal;
  private BigDecimal retencion;
  private Double retencionPorciento;
  private BigDecimal montoDescuento;
  private BigDecimal montoRecargo;
  private BigDecimal itbis;
  private BigDecimal montoItbisRetenido;

  /** ID de MgItbis. */
  private Integer itbisId;

  private Double itbisPorciento;
  private BigDecimal total;
  private Boolean indicadorBienServicio;
  private String estado;
  private Integer formaPagoId;
}
