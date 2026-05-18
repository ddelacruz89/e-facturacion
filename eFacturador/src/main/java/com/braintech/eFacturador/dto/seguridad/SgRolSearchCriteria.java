package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SgRolSearchCriteria {
  private String nombre;
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
}
