package com.braintech.eFacturador.seguridad.model;

import lombok.Data;

@Data
public class VerificarRecuperacionRequest {
  private String email;
  private String codigo;
  private String passwordNueva;
}
