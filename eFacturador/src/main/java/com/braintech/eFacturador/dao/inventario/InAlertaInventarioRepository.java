package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InAlertaInventario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InAlertaInventarioRepository extends JpaRepository<InAlertaInventario, Integer> {

  // ── STOCK_BAJO ────────────────────────────────────────────────────────────

  /** Busca una alerta de stock activa para un producto/almacén/tenant exacto. */
  Optional<InAlertaInventario>
      findByTipoAndProductoIdAndAlmacenIdAndEmpresaIdAndSucursalIdIdAndEstadoId(
          String tipo,
          Integer productoId,
          Integer almacenId,
          Integer empresaId,
          Integer sucursalId,
          String estadoId);

  // ── VENCIMIENTO ───────────────────────────────────────────────────────────

  /** Busca una alerta de vencimiento activa para un lote/producto/tenant exacto. */
  Optional<InAlertaInventario> findByTipoAndLoteAndProductoIdAndEmpresaIdAndEstadoId(
      String tipo, String lote, Integer productoId, Integer empresaId, String estadoId);

  // ── Consultas de reporte ──────────────────────────────────────────────────

  /** Todas las alertas activas del tenant, ordenadas por fecha descendente. */
  @Query(
      """
      SELECT a FROM InAlertaInventario a
      WHERE a.empresaId = :empresaId
        AND a.sucursalId.id = :sucursalId
        AND a.estadoId = 'ACT'
      ORDER BY a.fechaReg DESC
      """)
  List<InAlertaInventario> findActivasByTenant(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  /** Alertas activas filtradas por tipo para un tenant. */
  @Query(
      """
      SELECT a FROM InAlertaInventario a
      WHERE a.empresaId = :empresaId
        AND a.sucursalId.id = :sucursalId
        AND a.tipo = :tipo
        AND a.estadoId = 'ACT'
      ORDER BY a.fechaReg DESC
      """)
  List<InAlertaInventario> findActivasByTipoAndTenant(
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("tipo") String tipo);
}
