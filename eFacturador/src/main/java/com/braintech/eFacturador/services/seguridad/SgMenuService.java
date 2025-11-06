package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgMenu;
import java.util.List;

public interface SgMenuService {
  List<SgMenu> getAllActive();

  List<SgMenu> getAll();

  SgMenu getById(Integer id);

  List<SgMenu> getByModuloId(String moduloId);

  List<SgMenu> getByTipoMenuId(Integer tipoMenuId);

  SgMenu create(SgMenu menu);

  void delete(Integer id);
}
