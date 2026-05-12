package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SgRolResumenDTO {
  private Integer id;
  private LocalDateTime fechaReg;
  private String nombre;
  private String descripcion;
  private Long cantidadPermisos;
  private Long cantidadUsuarios;
  private String usuarioReg;
  private Boolean activo;
}
