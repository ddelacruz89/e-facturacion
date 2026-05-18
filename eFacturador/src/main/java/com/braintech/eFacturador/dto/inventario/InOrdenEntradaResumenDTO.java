package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InOrdenEntradaResumenDTO {
  private Integer id;
  private LocalDateTime fechaReg;
  private String almacenNombre;
  private BigDecimal total;
  private String usuarioReg;
  private String estadoId;
}
