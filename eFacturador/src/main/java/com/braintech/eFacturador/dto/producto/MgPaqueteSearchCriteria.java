package com.braintech.eFacturador.dto.producto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class MgPaqueteSearchCriteria {
  private String nombre;
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
}
