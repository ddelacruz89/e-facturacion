package com.braintech.eFacturador.dto.inventario;

import lombok.Data;

@Data
public class InAlmacenSearchCriteria {
  private String nombre;
  private String estadoId;
  private Integer sucursalId;
}
