package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgPermiso;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgPermisoRepository extends JpaRepository<SgPermiso, Integer> {

  List<SgPermiso> findByRolIdAndEmpresaId(Integer rolId, Integer empresaId);

  Optional<SgPermiso> findByRolIdAndMenuIdAndEmpresaId(
      Integer rolId, Integer menuId, Integer empresaId);

  @Modifying
  @Query("DELETE FROM SgPermiso p WHERE p.rol.id = :rolId AND p.empresaId = :empresaId")
  void deleteByRolIdAndEmpresaId(
      @Param("rolId") Integer rolId, @Param("empresaId") Integer empresaId);

  /**
   * Retorna los permisos que el usuario tiene sobre un menú específico (identificado por su URL),
   * considerando todos sus roles activos en la empresa y sucursal del token JWT.
   *
   * <p>El llamador elige qué flag revisar (puedeLeer, puedeEscribir, etc.) según la acción.
   */
  @Query(
      """
      SELECT p FROM SgPermiso p
      JOIN SgUsuarioRol ur ON ur.rol.id = p.rol.id
      WHERE ur.usuario.username = :username
        AND ur.empresaId        = :empresaId
        AND ur.sucursalId.id    = :sucursalId
        AND ur.activo           = true
        AND p.empresaId         = :empresaId
        AND p.menu.url          = :menuUrl
      """)
  List<SgPermiso> findPermisosForMenu(
      @Param("username") String username,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("menuUrl") String menuUrl);

  /** IDs de todos los menús donde el usuario tiene puedeLeer=true en su empresa y sucursal. */
  @Query(
      """
      SELECT p.menu.id FROM SgPermiso p
      JOIN SgUsuarioRol ur ON ur.rol.id = p.rol.id
      WHERE ur.usuario.username = :username
        AND ur.empresaId        = :empresaId
        AND ur.sucursalId.id    = :sucursalId
        AND ur.activo           = true
        AND p.empresaId         = :empresaId
        AND p.puedeLeer         = true
      """)
  Set<Integer> findMenuIdsPermitidos(
      @Param("username") String username,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);
}
