package com.braintech.eFacturador.dto.facturacion;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface IFacturaResumen {
  String getId();

  String getSecuencia();

  String getRazonSocial();

  String getNcf();

  @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
  LocalDateTime getFechaReg();

  String getRnc();

  String getEstadoId();

  BigDecimal getTotal();
}
