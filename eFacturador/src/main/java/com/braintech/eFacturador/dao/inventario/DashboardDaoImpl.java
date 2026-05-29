package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.DashboardAjusteBarDTO;
import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
import com.braintech.eFacturador.dto.inventario.DashboardTendenciaDTO;
import com.braintech.eFacturador.dto.inventario.OrdenCompraEntregaHoyDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.math.BigDecimal;
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

  // ── Ajustes de inventario por tipo (últimos 7 días) ─────────────────────────

  @Override
  public List<DashboardAjusteBarDTO> kpiAjustesPorTipo(Integer empresaId, Integer sucursalId) {
    String sucFilter = sucursalId != null ? " AND a.sucursal_id = :sucursalId " : "";

    String sql =
        "WITH tipos AS ( "
            + "  SELECT unnest(ARRAY[4, 5, 9, 20]) AS tipo_id "
            + "), "
            + "conteos AS ( "
            + "  SELECT a.movimiento_tipo_id, COUNT(*) AS total "
            + "  FROM inventario.in_ajuste_inventario a "
            + "  WHERE a.empresa_id = :empresaId "
            + sucFilter
            + "    AND a.movimiento_tipo_id IN (4, 5, 9, 20) "
            + "    AND a.fecha_reg >= CURRENT_DATE - INTERVAL '6 days' "
            + "    AND a.estado_id != 'ANU' "
            + "  GROUP BY a.movimiento_tipo_id "
            + ") "
            + "SELECT t.tipo_id, mt.tipo_movimiento, COALESCE(c.total, 0) AS total "
            + "FROM tipos t "
            + "JOIN inventario.in_movimientos_tipos mt ON mt.id = t.tipo_id "
            + "LEFT JOIN conteos c ON c.movimiento_tipo_id = t.tipo_id "
            + "ORDER BY t.tipo_id";

    Query q = em.createNativeQuery(sql).setParameter("empresaId", empresaId);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    return rows.stream()
        .map(
            r ->
                new DashboardAjusteBarDTO(
                    ((Number) r[0]).intValue(), (String) r[1], ((Number) r[2]).longValue()))
        .collect(Collectors.toList());
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

  // ── Pedidos con entrega hoy ───────────────────────────────────────────────────

  @Override
  public List<OrdenCompraEntregaHoyDTO> pedidosEntregaHoy(Integer empresaId, Integer sucursalId) {
    String sucFilter = sucursalId != null ? " AND oc.sucursal_id = :sucursalId " : "";

    String sql =
        "SELECT oc.id, s.nombre, oc.total, oc.estado_id, oc.fecha_reg "
            + "FROM inventario.in_ordenes_compras oc "
            + "JOIN inventario.in_suplidor s ON s.id = oc.suplidor_id "
            + "WHERE oc.empresa_id = :empresaId "
            + sucFilter
            + "  AND oc.fecha_entrega_tentativa = CURRENT_DATE "
            + "  AND oc.estado_id != 'INA' "
            + "ORDER BY oc.id DESC";

    Query q = em.createNativeQuery(sql).setParameter("empresaId", empresaId);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    return rows.stream()
        .map(
            r ->
                new OrdenCompraEntregaHoyDTO(
                    ((Number) r[0]).intValue(),
                    (String) r[1],
                    r[2] != null ? (BigDecimal) r[2] : BigDecimal.ZERO,
                    (String) r[3],
                    r[4] != null ? ((java.sql.Timestamp) r[4]).toLocalDateTime() : null))
        .collect(Collectors.toList());
  }

  @Override
  public List<OrdenCompraEntregaHoyDTO> pedidosEntregaManana(
      Integer empresaId, Integer sucursalId) {
    String sucFilter = sucursalId != null ? " AND oc.sucursal_id = :sucursalId " : "";

    String sql =
        "SELECT oc.id, s.nombre, oc.total, oc.estado_id, oc.fecha_reg "
            + "FROM inventario.in_ordenes_compras oc "
            + "JOIN inventario.in_suplidor s ON s.id = oc.suplidor_id "
            + "WHERE oc.empresa_id = :empresaId "
            + sucFilter
            + "  AND oc.fecha_entrega_tentativa = CURRENT_DATE + 1 "
            + "  AND oc.estado_id != 'INA' "
            + "ORDER BY oc.id DESC";

    Query q = em.createNativeQuery(sql).setParameter("empresaId", empresaId);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = q.getResultList();

    return rows.stream()
        .map(
            r ->
                new OrdenCompraEntregaHoyDTO(
                    ((Number) r[0]).intValue(),
                    (String) r[1],
                    r[2] != null ? (BigDecimal) r[2] : BigDecimal.ZERO,
                    (String) r[3],
                    r[4] != null ? ((java.sql.Timestamp) r[4]).toLocalDateTime() : null))
        .collect(Collectors.toList());
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
