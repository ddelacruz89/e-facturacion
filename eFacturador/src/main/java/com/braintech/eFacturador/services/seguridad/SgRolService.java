package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgRolResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgRolSearchCriteria;
import com.braintech.eFacturador.jpa.seguridad.SgRol;
import com.braintech.eFacturador.jpa.seguridad.SgUsuarioRol;
import java.util.List;

public interface SgRolService {

  List<SgRolResumenDTO> buscar(SgRolSearchCriteria criteria);

  SgRol getById(Integer id);

  SgRol save(SgRol rol);

  List<SgUsuarioRol> getUsuariosRol(Integer rolId);

  SgUsuarioRol addUsuarioRol(Integer rolId, String username);

  void removeUsuarioRol(Integer asignacionId);
}
