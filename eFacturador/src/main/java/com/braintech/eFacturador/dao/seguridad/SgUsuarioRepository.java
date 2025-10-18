package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SgUsuarioRepository extends JpaRepository<SgUsuario, String> {
  // SgUsuario extends BaseSucursal - filter by empresaId AND sucursalId

  // For authentication (no filtering - finds user globally)
  SgUsuario findByUsername(String username);

  @Query("SELECT u FROM SgUsuario u WHERE u.username = :loginEmail OR u.loginEmail = :loginEmail")
  SgUsuario findByLoginEmailOrUsernameV1(@Param("loginEmail") String loginEmail);

  // Multi-tenant queries
  @Query("SELECT u FROM SgUsuario u WHERE u.empresaId = :empresaId")
  List<SgUsuario> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT u FROM SgUsuario u WHERE u.empresaId = :empresaId AND u.sucursalId.id = :sucursalId")
  List<SgUsuario> findAllByEmpresaIdAndSucursalId(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  @Query("SELECT u FROM SgUsuario u WHERE u.username = :id AND u.empresaId = :empresaId")
  Optional<SgUsuario> findByIdAndEmpresaId(
      @Param("id") String id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT u FROM SgUsuario u WHERE u.username = :id AND u.empresaId = :empresaId AND u.sucursalId.id = :sucursalId")
  Optional<SgUsuario> findByIdAndEmpresaIdAndSucursalId(
      @Param("id") String id,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);
}
