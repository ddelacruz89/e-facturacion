package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MisEntregasOrdenDTO {
  private Integer id;
  private Integer secuencia;
  private Integer facturaId;
  private Integer facturaSecuencia;
  private String clienteNombre;
  private String clienteTelefono;
  private String direccionEntrega;
  private LocalDateTime fechaCompromiso;
  private LocalDateTime fechaEntrega;
  private String estadoId;
  private String notas;
  private String reciboUrl;

  /** true si la empresa tiene el feature "Recibo de Entrega" activo. Seteado por el service. */
  private Boolean requiereRecibo;

  /**
   * Constructor 12-arg usado por las queries JPQL (sin requiereRecibo — se setea en el service).
   */
  public MisEntregasOrdenDTO(
      Integer id,
      Integer secuencia,
      Integer facturaId,
      Integer facturaSecuencia,
      String clienteNombre,
      String clienteTelefono,
      String direccionEntrega,
      LocalDateTime fechaCompromiso,
      LocalDateTime fechaEntrega,
      String estadoId,
      String notas,
      String reciboUrl) {
    this.id = id;
    this.secuencia = secuencia;
    this.facturaId = facturaId;
    this.facturaSecuencia = facturaSecuencia;
    this.clienteNombre = clienteNombre;
    this.clienteTelefono = clienteTelefono;
    this.direccionEntrega = direccionEntrega;
    this.fechaCompromiso = fechaCompromiso;
    this.fechaEntrega = fechaEntrega;
    this.estadoId = estadoId;
    this.notas = notas;
    this.reciboUrl = reciboUrl;
  }
}
