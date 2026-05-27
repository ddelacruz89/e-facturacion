package com.braintech.eFacturador.seguridad.model;

import lombok.Data;

@Data
public class CambiarPasswordRequest {
  private String passwordActual;
  private String passwordNueva;
}
