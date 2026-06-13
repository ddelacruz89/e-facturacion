package com.braintech.eFacturador.dao.notificacion;

import com.braintech.eFacturador.jpa.notificacion.SgNotificacion;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgNotificacionRepository extends JpaRepository<SgNotificacion, Integer> {

  /** Deduplicación: existe una notificación activa con esta clave de negocio para la empresa. */
  boolean existsByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId(
      String modulo, String tipo, String referenciaKey, Integer empresaId, String estadoId);

  /** Busca una notificación activa por clave de negocio y empresa (para actualizar payload). */
  Optional<SgNotificacion> findByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId(
      String modulo, String tipo, String referenciaKey, Integer empresaId, String estadoId);

  /**
   * Notificaciones activas del tenant visibles para el usuario. urlsPermitidas = URLs de menú donde
   * el usuario tiene puedeLeer=true. Alertas con menuUrlOrigen=NULL son globales y las ve
   * cualquiera.
   */
  @Query(
      """
      SELECT n FROM SgNotificacion n
      WHERE n.empresaId = :empresaId
        AND n.sucursalId = :sucursalId
        AND n.estadoId = 'ACT'
        AND (n.menuUrlOrigen IS NULL OR n.menuUrlOrigen IN :urlsPermitidas)
      ORDER BY n.fechaReg DESC
      """)
  List<SgNotificacion> findActivasByTenant(
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("urlsPermitidas") Collection<String> urlsPermitidas);

  /** Notificaciones activas filtradas por módulo, visibles para el usuario. */
  @Query(
      """
      SELECT n FROM SgNotificacion n
      WHERE n.empresaId = :empresaId
        AND n.sucursalId = :sucursalId
        AND n.modulo = :modulo
        AND n.estadoId = 'ACT'
        AND (n.menuUrlOrigen IS NULL OR n.menuUrlOrigen IN :urlsPermitidas)
      ORDER BY n.fechaReg DESC
      """)
  List<SgNotificacion> findActivasByModuloAndTenant(
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("modulo") String modulo,
      @Param("urlsPermitidas") Collection<String> urlsPermitidas);

  /**
   * Notificaciones pendientes al login para el usuario.
   *
   * <p>Reglas de acceso (en orden):
   *
   * <ol>
   *   <li>Si la notificación tiene destinatarios específicos → solo esos usuarios la ven.
   *   <li>Si no tiene destinatarios → aplica tipo: noRestringido (todos) o suscrito (opt-in).
   * </ol>
   *
   * <p>Reglas de visibilidad:
   *
   * <ul>
   *   <li>{@code repetirLogin=false}: se oculta tras el primer "Entendido" (NOT EXISTS visto).
   *   <li>{@code repetirLogin=true}: reaparece en cada login hasta {@code fechaExpiracion}.
   *   <li>{@code fechaExpiracion} NULL = sin límite de tiempo.
   * </ul>
   */
  @Query(
      """
      SELECT n FROM SgNotificacion n
      WHERE n.empresaId = :empresaId
        AND n.estadoId = 'ACT'
        AND n.paraLogin = TRUE
        AND (n.fechaExpiracion IS NULL OR n.fechaExpiracion > CURRENT_TIMESTAMP)
        AND (
            n.repetirLogin = TRUE
            OR NOT EXISTS (
                SELECT v FROM SgNotificacionVisto v
                WHERE v.notificacion.id = n.id AND v.username = :username
            )
        )
        AND (
            EXISTS (
                SELECT d FROM SgNotificacionDestinatario d
                WHERE d.notificacion.id = n.id AND d.username = :username
            )
            OR (
                NOT EXISTS (
                    SELECT d FROM SgNotificacionDestinatario d WHERE d.notificacion.id = n.id
                )
                AND (n.tipo IN :tiposNoRestringidos OR n.tipo IN :tiposSuscritos)
            )
        )
      ORDER BY n.fechaReg DESC
      """)
  List<SgNotificacion> findLoginPendientes(
      @Param("empresaId") Integer empresaId,
      @Param("username") String username,
      @Param("tiposNoRestringidos") Set<String> tiposNoRestringidos,
      @Param("tiposSuscritos") Set<String> tiposSuscritos);

  /** Cuenta notificaciones activas no vistas por el usuario, respetando sus permisos de menú. */
  @Query(
      """
      SELECT COUNT(n) FROM SgNotificacion n
      WHERE n.empresaId = :empresaId
        AND n.sucursalId = :sucursalId
        AND n.estadoId = 'ACT'
        AND (n.menuUrlOrigen IS NULL OR n.menuUrlOrigen IN :urlsPermitidas)
        AND NOT EXISTS (
            SELECT v FROM SgNotificacionVisto v
            WHERE v.notificacion.id = n.id AND v.username = :username
        )
      """)
  long contarNoVistas(
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("username") String username,
      @Param("urlsPermitidas") Collection<String> urlsPermitidas);
}
