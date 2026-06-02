package com.braintech.eFacturador.dto.general;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MgBarrioParajeResumenDTO {
  private Integer id;
  private String nombre;
  private Integer seccionId;
  private BigDecimal precioEnvio;
}
