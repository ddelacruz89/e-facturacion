package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import lombok.Data;

@Data
public class InRequisicionSearchCriteria {
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
  private Integer almacenSolicitanteId;
  private Integer almacenOrigenId;
  private String prioridad;
  private String estadoId;
  private Integer page = 0;
  private Integer size = 10;
}
