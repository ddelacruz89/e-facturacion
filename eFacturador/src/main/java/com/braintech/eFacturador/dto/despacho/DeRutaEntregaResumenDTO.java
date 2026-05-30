package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeRutaEntregaResumenDTO {
  private Integer id;
  private Integer secuencia;
  private LocalDateTime fechaReg;
  private LocalDate fecha;
  private String vehiculoDescripcion;
  private String vehiculoPlaca;
  private String conductorUsername;
  private Long totalOrdenes;
  private String estadoId;
  private String usuarioReg;
}
