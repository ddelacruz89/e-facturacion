package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InOrdenesComprasSimpleDTO {
  private Integer id;
  private String suplidorNombre;
  private BigDecimal total;
  private String estadoId;
  private LocalDateTime fechaReg;
}
