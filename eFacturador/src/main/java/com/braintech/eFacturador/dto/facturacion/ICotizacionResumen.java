package com.braintech.eFacturador.dto.facturacion;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface ICotizacionResumen {
  String getId();

  String getSecuencia();

  String getRazonSocial();

  @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
  LocalDateTime getFechaReg();

  String getRnc();

  BigDecimal getTotal();
}
