package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgAprobacionResumenDTO;
import com.braintech.eFacturador.jpa.seguridad.SgAprobacion;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SgAprobacionRepository extends JpaRepository<SgAprobacion, Integer> {

  @Query("SELECT a FROM SgAprobacion a WHERE a.id = :id AND a.empresaId = :empresaId")
  Optional<SgAprobacion> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  /** Busca la aprobación activa de un documento concreto. */
  @Query(
      """
      SELECT a FROM SgAprobacion a
      WHERE a.empresaId = :empresaId
        AND a.tipoDocumento = :tipoDocumento
        AND a.documentoId = :documentoId
      ORDER BY a.fechaSolicitud DESC
      """)
  List<SgAprobacion> findByDocumento(
      @Param("empresaId") Integer empresaId,
      @Param("tipoDocumento") String tipoDocumento,
      @Param("documentoId") Integer documentoId);

  /** Búsqueda de resumen con filtros. Si soloAprobador != null filtra por aprobador pendiente. */
  @Query(
      """
      SELECT DISTINCT new com.braintech.eFacturador.dto.seguridad.SgAprobacionResumenDTO(
          a.id, a.tipoDocumento, a.documentoId,
          a.solicitante.username, a.solicitante.nombre,
          a.modoAprobacion, a.estadoId,
          a.fechaSolicitud, a.fechaResolucion,
          (SELECT COUNT(d) FROM SgAprobacionDetalle d WHERE d.aprobacion.id = a.id),
          (SELECT COUNT(d2) FROM SgAprobacionDetalle d2 WHERE d2.aprobacion.id = a.id AND d2.estadoId = 'PEN'))
      FROM SgAprobacion a
      LEFT JOIN a.detalle det
      WHERE a.empresaId = :empresaId
        AND a.fechaSolicitud BETWEEN :desde AND :hasta
        AND (CAST(:tipoDocumento AS String) IS NULL OR a.tipoDocumento = :tipoDocumento)
        AND (CAST(:estadoId AS String) IS NULL OR a.estadoId = :estadoId)
        AND (CAST(:solicitante AS String) IS NULL OR LOWER(a.solicitante.username) LIKE LOWER(CONCAT('%', CAST(:solicitante AS String), '%')))
        AND (CAST(:aprobador AS String) IS NULL OR (det.aprobador.username = :aprobador AND det.estadoId = 'PEN'))
      ORDER BY a.fechaSolicitud DESC
      """)
  List<SgAprobacionResumenDTO> buscar(
      @Param("empresaId") Integer empresaId,
      @Param("desde") LocalDateTime desde,
      @Param("hasta") LocalDateTime hasta,
      @Param("tipoDocumento") String tipoDocumento,
      @Param("estadoId") String estadoId,
      @Param("solicitante") String solicitante,
      @Param("aprobador") String aprobador);
}
