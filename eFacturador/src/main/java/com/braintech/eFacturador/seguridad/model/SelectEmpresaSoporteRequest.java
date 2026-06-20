package com.braintech.eFacturador.seguridad.model;

import lombok.Data;

/**
 * Cuerpo de la petición {@code POST /api/auth/select-empresa-soporte}. El usuario soporte envía el
 * preAuthToken obtenido en el login y el ID de la empresa a la que desea acceder.
 */
@Data
public class SelectEmpresaSoporteRequest {
  /** Pre-auth token obtenido en el login (claim preAuth=true). */
  private String preAuthToken;

  /** ID de la empresa destino (debe tener un grant activo para este usuario). */
  private Integer empresaIdDestino;
}
