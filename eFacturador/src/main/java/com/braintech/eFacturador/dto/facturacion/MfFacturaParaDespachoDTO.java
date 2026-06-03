package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MfFacturaParaDespachoDTO {
  private Integer id;
  private Integer secuencia;
  private String razonSocial;
  private Integer clienteId;
  private BigDecimal total;
  private LocalDateTime fechaReg;

  /** Se llena en el service usando el cliente cargado por clienteId. */
  private String direccionEntrega;

  /** Constructor usado por el JPQL en FacturaDao. */
  public MfFacturaParaDespachoDTO(
      Integer id,
      Integer secuencia,
      String razonSocial,
      Integer clienteId,
      BigDecimal total,
      LocalDateTime fechaReg) {
    this.id = id;
    this.secuencia = secuencia;
    this.razonSocial = razonSocial;
    this.clienteId = clienteId;
    this.total = total;
    this.fechaReg = fechaReg;
  }
}
