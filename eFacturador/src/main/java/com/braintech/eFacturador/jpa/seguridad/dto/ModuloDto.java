package com.braintech.eFacturador.jpa.seguridad.dto;

import java.util.List;

public interface ModuloDto {
  String getId();

  String getModulo();

  List<menuDto> getMenus();
}
