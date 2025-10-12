package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SgUsuarioDao extends JpaRepository<SgUsuario, String> {

  @Query(
      """
            select s from SgUsuario s where s.sucursalId.empresa.id = ?1
            """)
  List<SgUsuario> findAllByEmpresaId(Integer empresaId);

  @Query(
      """
            select s from SgUsuario s where s.sucursalId.empresa.id = ?1 and s.username = ?2
            """)
  Optional<SgUsuario> findByUsername(Integer empresaId, String username);
}
