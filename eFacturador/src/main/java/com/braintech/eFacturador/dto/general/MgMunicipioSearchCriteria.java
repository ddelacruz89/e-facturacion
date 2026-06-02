package com.braintech.eFacturador.dto.general;

import lombok.Data;

@Data
public class MgMunicipioSearchCriteria {
  private String codProvincia;
  private String nombre;
  private Boolean esDm;
  private Integer parentId;
  private Integer page;
  private Integer size;
}
