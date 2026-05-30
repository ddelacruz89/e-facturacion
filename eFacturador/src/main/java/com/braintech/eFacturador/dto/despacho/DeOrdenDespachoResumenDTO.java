package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
