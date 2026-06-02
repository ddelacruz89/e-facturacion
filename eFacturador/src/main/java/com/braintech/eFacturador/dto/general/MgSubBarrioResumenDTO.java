package com.braintech.eFacturador.dto.general;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MgSubBarrioResumenDTO {
  private Integer id;
  private String codSub;
  private String nombre;
  private Integer barrioId;
}
