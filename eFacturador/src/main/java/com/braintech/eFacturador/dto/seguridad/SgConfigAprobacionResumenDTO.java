package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SgConfigAprobacionResumenDTO {
  private Integer id;
  private String nombre;
  private String tipoDocumento;
  private String modoAprobacion;
  private Long cantidadNiveles;
  private Boolean activo;
  private LocalDateTime fechaReg;
  private String usuarioReg;
}
