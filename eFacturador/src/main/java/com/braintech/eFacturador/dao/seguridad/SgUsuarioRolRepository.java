package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.jpa.seguridad.SgUsuarioRol;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgUsuarioRolRepository extends JpaRepository<SgUsuarioRol, Integer> {

  @Query(
      """
      SELECT ur FROM SgUsuarioRol ur
      WHERE ur.rol.id = :rolId
        AND ur.empresaId = :empresaId
        AND ur.sucursalId.id = :sucursalId
      """)
  List<SgUsuarioRol> findByRolAndSucursal(
      @Param("rolId") Integer rolId,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  @Query(
      """
      SELECT ur FROM SgUsuarioRol ur
      WHERE ur.usuario.username = :username
        AND ur.empresaId = :empresaId
        AND ur.sucursalId.id = :sucursalId
        AND ur.activo = true
      """)
  List<SgUsuarioRol> findActiveByUsuarioAndSucursal(
      @Param("username") String username,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  /**
   * Retorna todas las sucursales distintas a las que tiene acceso el usuario (al menos un rol
   * activo). SgSucursal carga su empresa de forma EAGER, así que en una sola query obtenemos toda
   * la info para construir el selector.
   */
  @Query(
      """
      SELECT DISTINCT ur.sucursalId FROM SgUsuarioRol ur
      WHERE ur.usuario.username = :username
        AND ur.activo = true
      """)
  List<SgSucursal> findSucursalesActivasByUsername(@Param("username") String username);
}
