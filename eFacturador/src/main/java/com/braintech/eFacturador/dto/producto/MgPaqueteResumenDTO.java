package com.braintech.eFacturador.dto.producto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MgPaqueteResumenDTO {
  private Integer id;
  private LocalDateTime fechaReg;
  private String nombre;
  private BigDecimal precioVenta;
  private Long cantidadItems;
  private String usuarioReg;
  private Boolean activo;
}
