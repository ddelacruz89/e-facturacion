package com.braintech.eFacturador.seguridad.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SucursalOpcionDTO {
  private Integer sucursalId;
  private String sucursalNombre;
  private Integer empresaId;
  private String empresaNombre;
}
