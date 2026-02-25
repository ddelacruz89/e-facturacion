package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import lombok.Data;

@Data
public class InOrdenesComprasSearchCriteria {
  private LocalDate fechaInicio; // mandatorio
  private LocalDate fechaFin; // mandatorio
  private Integer suplidorId;
  private Integer id;
  private String estadoId;
  private Integer page = 0;
  private Integer size = 10;

  // Si es false, no ejecuta el count query (mejor performance)
  // El frontend puede decidir si necesita el total o no
  private Boolean includeCount = true;
}
