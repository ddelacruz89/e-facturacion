package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SgUsuarioResumenDTO {
  private String username;
  private String nombre;
  private String loginEmail;
  private LocalDateTime fechaReg;
  private String usuarioReg;
  private String estadoId;
}
