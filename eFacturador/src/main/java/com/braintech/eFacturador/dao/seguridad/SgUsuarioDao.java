package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SgUsuarioDao extends JpaRepository<SgUsuario, String> {
  // SgUsuario extends BaseSucursal - filter by empresaId AND sucursalId

  @Query("SELECT s FROM SgUsuario s WHERE s.empresaId = :empresaId")
  List<SgUsuario> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT s FROM SgUsuario s WHERE s.empresaId = :empresaId AND s.sucursalId.id = :sucursalId")
  List<SgUsuario> findAllByEmpresaIdAndSucursalId(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  @Query("SELECT s FROM SgUsuario s WHERE s.username = :id AND s.empresaId = :empresaId")
  Optional<SgUsuario> findByIdAndEmpresaId(
      @Param("id") String id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT s FROM SgUsuario s WHERE s.username = :id AND s.empresaId = :empresaId AND s.sucursalId.id = :sucursalId")
  Optional<SgUsuario> findByIdAndEmpresaIdAndSucursalId(
      @Param("id") String id,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  @Query("SELECT s FROM SgUsuario s WHERE s.empresaId = :empresaId AND s.username = :username")
  Optional<SgUsuario> findByUsername(
      @Param("empresaId") Integer empresaId, @Param("username") String username);
}
