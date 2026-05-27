package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.dto.seguridad.AdminResetPasswordResponse;
import com.braintech.eFacturador.dto.seguridad.SgUsuarioResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgUsuarioSearchCriteria;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import java.util.List;

public interface SgUsuarioService {
  List<SgUsuarioResumenDTO> buscar(SgUsuarioSearchCriteria criteria);

  SgUsuario getById(String username);

  SgUsuario save(SgUsuario usuario);

  SgUsuario update(String username, SgUsuario usuario);

  AdminResetPasswordResponse resetearPassword(String username);
}
