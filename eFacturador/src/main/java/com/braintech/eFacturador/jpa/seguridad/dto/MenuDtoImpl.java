package com.braintech.eFacturador.jpa.seguridad.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MenuDtoImpl implements menuDto {
  private Integer id;
  private String menu;
  private String url;
  private String urlSql;
}
