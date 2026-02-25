package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import lombok.Data;

@Data
public class InOrdenEntradaSearchCriteria {
  private LocalDate fechaInicio; // mandatorio
  private LocalDate fechaFin; // mandatorio
  private Integer suplidorId;
  private Integer id;
  private String estadoId;
  private Integer page = 0;
  private Integer size = 10;
}
