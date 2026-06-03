package com.braintech.eFacturador.dto.despacho;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeOrdenDespachoResumenDTO {
  private Integer id;
  private Integer secuencia;
  private LocalDateTime fechaReg;
  private Integer facturaSecuencia;
  private String clienteNombre;
  private LocalDateTime fechaCompromiso;
  private String conductorUsername;
  private String estadoId;
  private String usuarioReg;
  private String reciboUrl;

  /** Constructor 10-arg usado por el JPQL de searchByCriteria. */
  public DeOrdenDespachoResumenDTO(
      Integer id,
      Integer secuencia,
      LocalDateTime fechaReg,
      Integer facturaSecuencia,
      String clienteNombre,
      LocalDateTime fechaCompromiso,
      String conductorUsername,
      String estadoId,
      String usuarioReg,
      String reciboUrl) {
    this.id = id;
    this.secuencia = secuencia;
    this.fechaReg = fechaReg;
    this.facturaSecuencia = facturaSecuencia;
    this.clienteNombre = clienteNombre;
    this.fechaCompromiso = fechaCompromiso;
    this.conductorUsername = conductorUsername;
    this.estadoId = estadoId;
    this.usuarioReg = usuarioReg;
    this.reciboUrl = reciboUrl;
  }
}
