package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InAlmacenResumenDTO {
  private Integer id;
  private String nombre;
  private String ubicacion;
  private Integer sucursalId;
  private String sucursalNombre;
  private String estadoId;
  private String usuarioReg;
}
