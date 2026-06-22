package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SgUsuarioSearchCriteria {
  private String q; // busca en username y nombre
  private LocalDate fechaInicio;
  private LocalDate fechaFin;

  /** Si true, retorna solo usuarios con esChofer = true. */
  private boolean soloChoferes = false;
}
