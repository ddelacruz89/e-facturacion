package com.braintech.eFacturador.seguridad.model;

import lombok.Data;

@Data
public class SelectSucursalRequest {
  private String preAuthToken;
  private Integer sucursalId;
}
