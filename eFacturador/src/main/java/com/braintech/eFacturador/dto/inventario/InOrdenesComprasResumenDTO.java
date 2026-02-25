package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InOrdenesComprasResumenDTO {
  private Integer id;
  private BigDecimal total;
  private String suplidorNombre;
  private String suplidorRnc;
  private String estadoId;
  private LocalDateTime fechaReg;
}
