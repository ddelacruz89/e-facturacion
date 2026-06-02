package com.braintech.eFacturador.dto.general;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MgMunicipioResumenDTO {
  private Integer id;
  private String codOne;
  private String nombre;
  private String codProvincia;
  private Integer parentId;
  private Boolean esDm;
}
