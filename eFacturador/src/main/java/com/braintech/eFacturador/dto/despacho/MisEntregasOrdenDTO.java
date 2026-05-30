package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
