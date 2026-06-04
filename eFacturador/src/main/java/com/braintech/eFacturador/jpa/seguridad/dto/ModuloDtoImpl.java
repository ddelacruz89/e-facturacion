package com.braintech.eFacturador.jpa.seguridad.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ModuloDtoImpl implements ModuloDto {
  private String id;
  private String modulo;
  private List<menuDto> menus;
  private Boolean sinLicencia;
}
