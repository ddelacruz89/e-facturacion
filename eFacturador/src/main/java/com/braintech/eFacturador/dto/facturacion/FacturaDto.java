package com.braintech.eFacturador.dto.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFacturaDetalle;
import java.math.BigDecimal;
import java.util.List;

public interface FacturaDto {
  Integer getTipoFacturaId();

  Integer getClienteId();

  String getRazonSocial();

  String getRnc();

  String getEstadoId();

  BigDecimal getMonto();

  BigDecimal getDescuento();

  BigDecimal getItbis();

  BigDecimal getRetencionItbis();

  BigDecimal getRetencionIsr();

  BigDecimal getTotal();

  List<MfFacturaDetalle> getDetalles();
}
