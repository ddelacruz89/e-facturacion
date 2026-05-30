package com.braintech.eFacturador.dto.despacho;

import lombok.Data;

@Data
public class DeVehiculoSearchCriteria {
  private String tipo;
  private String descripcion;
  private Boolean activo;
  private int page = 0;
  private int size = 20;
}
