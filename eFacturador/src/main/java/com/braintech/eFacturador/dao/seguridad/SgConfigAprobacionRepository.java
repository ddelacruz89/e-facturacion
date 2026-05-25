package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionResumenDTO;
import com.braintech.eFacturador.jpa.seguridad.SgConfigAprobacion;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SgConfigAprobacionRepository extends JpaRepository<SgConfigAprobacion, Integer> {

  /** Busca la configuración activa para un tipo de documento en una empresa. */
  @Query(
      """
      SELECT c FROM SgConfigAprobacion c
      WHERE c.empresaId = :empresaId
        AND c.tipoDocumento = :tipoDocumento
        AND c.activo = true
      """)
  Optional<SgConfigAprobacion> findActivaByTipoYEmpresa(
      @Param("tipoDocumento") String tipoDocumento, @Param("empresaId") Integer empresaId);

  /** Todas las configuraciones de una empresa con proyección resumen. */
  @Query(
      """
      SELECT new com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionResumenDTO(
          c.id, c.nombre, c.tipoDocumento, c.modoAprobacion,
          (SELECT COUNT(n) FROM SgConfigAprobacionNivel n WHERE n.config.id = c.id),
          c.activo, c.fechaReg, c.usuarioReg)
      FROM SgConfigAprobacion c
      WHERE c.empresaId = :empresaId
        AND c.fechaReg BETWEEN :desde AND :hasta
        AND (:tipoDocumento IS NULL OR LOWER(c.tipoDocumento) LIKE LOWER(CONCAT('%', :tipoDocumento, '%')))
        AND (:activo IS NULL OR c.activo = :activo)
      ORDER BY c.nombre ASC
      """)
  List<SgConfigAprobacionResumenDTO> buscar(
      @Param("empresaId") Integer empresaId,
      @Param("desde") LocalDateTime desde,
      @Param("hasta") LocalDateTime hasta,
      @Param("tipoDocumento") String tipoDocumento,
      @Param("activo") Boolean activo);

  @Query("SELECT c FROM SgConfigAprobacion c WHERE c.id = :id AND c.empresaId = :empresaId")
  Optional<SgConfigAprobacion> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);
}
