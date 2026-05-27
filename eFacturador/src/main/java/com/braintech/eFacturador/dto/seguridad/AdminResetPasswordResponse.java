package com.braintech.eFacturador.dto.seguridad;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminResetPasswordResponse {
  private String passwordTemporal;
}
