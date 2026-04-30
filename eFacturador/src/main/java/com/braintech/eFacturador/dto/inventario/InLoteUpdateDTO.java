package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import java.util.Date;
import lombok.Data;

/** Campos actualizables de un lote (PK y datos de tenant son inmutables). */
@Data
public class InLoteUpdateDTO {
  private Boolean serie;
  private Date fechaVencimiento;
  private LocalDate fechaAlertaVencimiento;
  private Integer alertasDias;
  private String estadoId;
}
