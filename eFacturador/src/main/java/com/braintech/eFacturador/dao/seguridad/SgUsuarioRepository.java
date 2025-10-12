package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SgUsuarioRepository extends JpaRepository<SgUsuario, String> {
  SgUsuario findByUsername(String username);

  @Query(
"""
select u from SgUsuario u where u.username=?1 or u.loginEmail=?1
""")
  SgUsuario findByLoginEmailOrUsernameV1(String loginEmail);
}
