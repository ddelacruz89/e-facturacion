package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
import com.braintech.eFacturador.dto.inventario.DashboardTendenciaDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardDaoImpl implements DashboardDao {

  @PersistenceContext private EntityManager em;

  // ── helper: 7 puntos diarios con generate_series ─────────────────────────────

  private List<DashboardTendenciaDTO> tendencia7Dias(
      String schema, String tabla, Integer empresaId, Integer sucursalId) {

    String sucFilter = sucursalId != null ? "    AND sucursal_id = :sucursalId " : "";

    String sql =
        "WITH dias AS ( "
            + "  SELECT generate_series( "
            + "    CURRENT_DATE - INTERVAL '6 days', "
            + "    CURRENT_DATE, "
            + "    INTERVAL '1 day')::date AS dia "
            + "), "
            + "conteos AS ( "
            + "  SELECT DATE(fecha_reg) AS dia, COUNT(*) AS total "
            + "  FROM "
            + schema
            + "."
            + tabla
            + " "
            + "  WHERE empresa_id = :empresaId "
            + sucFilter
            + "    AND fecha_reg >= CURRENT_DATE - INTERVAL '6 days' "
            + "    AND estado_id != 'INA' "
            + "  GROUP BY DATE(fecha_reg) "
            + ") "
            + "SELECT TO_CHAR(d.dia, 'DD/MM') AS dia, COALESCE(c.total, 0) AS total "
            + "FROM dias d LEFT JOIN conteos c ON c.dia = d.dia "
            + "ORDER BY d.dia";

    Query q = em.createNativeQuery(sql).setParameter("empresaId", empresaId);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    return rows.stream()
        .map(r -> new DashboardTendenciaDTO((String) r[0], ((Number) r[1]).longValue()))
        .collect(Collectors.toList());
  }

  // ── helper: COUNT simple ─────────────────────────────────────────────────────

  private long count(
      String schema, String tabla, Integer empresaId, Integer sucursalId, String whereExtra) {

    String sucFilter = sucursalId != null ? " AND sucursal_id = :sucursalId " : "";
    String sql =
        "SELECT COUNT(*) FROM "
            + schema
            + "."
            + tabla
            + " WHERE empresa_id = :empresaId "
            + sucFilter
            + whereExtra;

    Query q = em.createNativeQuery(sql).setParameter("empresaId", empresaId);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    return ((Number) q.getSingleResult()).longValue();
  }

  // ── Orden de Entrada ─────────────────────────────────────────────────────────

  @Override
  public DashboardKpiDTO kpiOrdenEntrada(Integer empresaId, Integer sucursalId) {
    long semana =
        count(
            "inventario",
            "in_orden_entrada",
            empresaId,
            sucursalId,
            "AND fecha_reg >= CURRENT_DATE - INTERVAL '6 days'");
    long pendientes =
        count("inventario", "in_orden_entrada", empresaId, sucursalId, "AND estado_id = 'PEN'");
    long completadas =
        count("inventario", "in_orden_entrada", empresaId, sucursalId, "AND estado_id = 'ACT'");

    return DashboardKpiDTO.builder()
        .modulo("ORDEN_ENTRADA")
        .titulo("Órdenes de Entrada")
        .total(semana)
        .labelTotal("últimos 7 días")
        .pendientes(pendientes)
        .labelPendientes("pendientes")
        .completadas(completadas)
        .labelCompletadas("completadas")
        .tendencia(tendencia7Dias("inventario", "in_orden_entrada", empresaId, sucursalId))
        .build();
  }

  // ── Orden de Compra ──────────────────────────────────────────────────────────

  @Override
  public DashboardKpiDTO kpiOrdenCompra(Integer empresaId, Integer sucursalId) {
    long semana =
        count(
            "inventario",
            "in_ordenes_compras",
            empresaId,
            sucursalId,
            "AND fecha_reg >= CURRENT_DATE - INTERVAL '6 days' AND estado_id != 'INA'");
    long pendientes =
        count("inventario", "in_ordenes_compras", empresaId, sucursalId, "AND estado_id = 'ACT'");
    long inactivas =
        count(
            "inventario",
            "in_ordenes_compras",
            empresaId,
            sucursalId,
            "AND estado_id = 'INA' AND fecha_reg >= CURRENT_DATE - INTERVAL '6 days'");

    return DashboardKpiDTO.builder()
        .modulo("ORDEN_COMPRA")
        .titulo("Órdenes de Compra")
        .total(semana)
        .labelTotal("últimos 7 días")
        .pendientes(pendientes)
        .labelPendientes("abiertas")
        .completadas(inactivas)
        .labelCompletadas("canceladas (7d)")
        .tendencia(tendencia7Dias("inventario", "in_ordenes_compras", empresaId, sucursalId))
        .build();
  }

  // ── Requisiciones ────────────────────────────────────────────────────────────

  @Override
  public DashboardKpiDTO kpiRequisicion(Integer empresaId, Integer sucursalId) {
    long pendientes =
        count(
            "inventario",
            "in_requisicion",
            empresaId,
            sucursalId,
            "AND estado_id IN ('PEN','PEN_APR')");
    long aprobadas =
        count("inventario", "in_requisicion", empresaId, sucursalId, "AND estado_id = 'APR'");
    long completadas =
        count("inventario", "in_requisicion", empresaId, sucursalId, "AND estado_id = 'COM'");

    return DashboardKpiDTO.builder()
        .modulo("REQUISICION")
        .titulo("Requisiciones")
        .total(pendientes)
        .labelTotal("pendientes aprobación")
        .pendientes(aprobadas)
        .labelPendientes("aprobadas")
        .completadas(completadas)
        .labelCompletadas("completadas")
        .tendencia(tendencia7Dias("inventario", "in_requisicion", empresaId, sucursalId))
        .build();
  }

  // ── Transferencias ───────────────────────────────────────────────────────────

  @Override
  public DashboardKpiDTO kpiTransferencia(Integer empresaId, Integer sucursalId) {
    long semana =
        count(
            "inventario",
            "in_transferencias",
            empresaId,
            sucursalId,
            "AND fecha_reg >= CURRENT_DATE - INTERVAL '6 days' AND estado_id != 'INA'");
    long pendientes =
        count("inventario", "in_transferencias", empresaId, sucursalId, "AND estado_id = 'PEN'");
    long completadas =
        count("inventario", "in_transferencias", empresaId, sucursalId, "AND estado_id = 'COM'");

    return DashboardKpiDTO.builder()
        .modulo("TRANSFERENCIA")
        .titulo("Transferencias")
        .total(semana)
        .labelTotal("últimos 7 días")
        .pendientes(pendientes)
        .labelPendientes("en tránsito")
        .completadas(completadas)
        .labelCompletadas("completadas")
        .tendencia(tendencia7Dias("inventario", "in_transferencias", empresaId, sucursalId))
        .build();
  }
}
