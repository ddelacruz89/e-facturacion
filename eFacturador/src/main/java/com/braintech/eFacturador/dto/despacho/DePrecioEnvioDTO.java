package com.braintech.eFacturador.dto.despacho;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DePrecioEnvioDTO {
  private Integer id;
  private Integer barrioId;
  private String barrioNombre;
  private Integer subBarrioId;
  private String subBarrioNombre;
  private BigDecimal precio;
}
