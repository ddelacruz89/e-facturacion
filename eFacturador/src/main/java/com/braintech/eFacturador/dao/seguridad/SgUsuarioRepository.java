package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SgUsuarioRepository extends JpaRepository<SgUsuario, String> {
  SgUsuario findByUsername(String username);
}
