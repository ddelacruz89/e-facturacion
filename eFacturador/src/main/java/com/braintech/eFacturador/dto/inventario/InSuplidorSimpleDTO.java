package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InSuplidorSimpleDTO {
  private Integer id;
  private String nombre;
  private String rnc;
}
