package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDateTime;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InLoteResumenDTO {
  private String lote;
  private Integer productoId;
  private String productoNombre;
  private Date fechaVencimiento;
  private String estadoId;
  private String usuarioReg;
  private LocalDateTime fechaReg;
}
