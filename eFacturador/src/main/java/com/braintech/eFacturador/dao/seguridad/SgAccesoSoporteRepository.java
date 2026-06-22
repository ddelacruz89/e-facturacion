package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgAccesoSoporte;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de solo lectura para los grants de acceso de soporte. La escritura de estos registros
 * es responsabilidad del sistema de management.
 */
@Repository
public interface SgAccesoSoporteRepository extends JpaRepository<SgAccesoSoporte, Integer> {

  /**
   * Todos los grants activos y no expirados para un usuario de soporte. Usado en el login para
   * construir la lista de empresas disponibles.
   */
  @Query(
      """
      SELECT a FROM SgAccesoSoporte a
      WHERE a.usernameSoporte = :username
        AND a.activo = true
        AND a.fechaExpiracion > :ahora
      ORDER BY a.fechaExpiracion ASC
      """)
  List<SgAccesoSoporte> findAccesosActivosByUsername(
      @Param("username") String username, @Param("ahora") LocalDateTime ahora);

  /**
   * Grant activo y no expirado para un par (usuario soporte, empresa). Usado en {@code
   * /select-empresa-soporte} para validar que el acceso sigue vigente antes de emitir el JWT.
   */
  @Query(
      """
      SELECT a FROM SgAccesoSoporte a
      WHERE a.usernameSoporte = :username
        AND a.empresaId        = :empresaId
        AND a.activo           = true
        AND a.fechaExpiracion  > :ahora
      """)
  Optional<SgAccesoSoporte> findAccesoActivoByUsernameAndEmpresa(
      @Param("username") String username,
      @Param("empresaId") Integer empresaId,
      @Param("ahora") LocalDateTime ahora);
}
