package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDate;
import lombok.Data;

@Data
public class DeRutaEntregaSearchCriteria {
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
  private String conductorUsername;
  private Integer vehiculoId;
  private String estadoId;
  private int page = 0;
  private int size = 10;
}
