package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InTopProductoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasMesDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSemanaDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSucursalDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
public class InReportesDaoImpl implements InReportesDao {

  @PersistenceContext private EntityManager em;

  private static final String JOIN_TIPOS =
      "JOIN inventario.in_movimientos_tipos t ON t.id = m.tipo_movimiento_id ";

  // ── helpers de mapeo ─────────────────────────────────────────────────────────

  private static int toInt(Object v) {
    return ((Number) v).intValue();
  }

  private static long toLong(Object v) {
    return ((Number) v).longValue();
  }

  private static BigDecimal toBd(Object v) {
    return v == null ? BigDecimal.ZERO : new BigDecimal(v.toString());
  }

  // ── ventasPorMes (dos años) ──────────────────────────────────────────────────

  @Override
  @SuppressWarnings("unchecked")
  public List<InVentasMesDTO> ventasPorMes(
      Integer empresaId, Integer anio, Integer anioAnterior, Integer sucursalId) {

    String sucFilter = sucursalId != null ? "AND m.sucursal_id = :sucursalId " : "";

    String sql =
        "SELECT EXTRACT(MONTH FROM m.fecha_reg)::INT AS mes, "
            + "       EXTRACT(YEAR  FROM m.fecha_reg)::INT AS anio, "
            + "       SUM(ABS(m.cantidad))              AS unidades, "
            + "       COALESCE(SUM(m.costo_total), 0)   AS costo_total "
            + "FROM inventario.in_movimientos m "
            + JOIN_TIPOS
            + "WHERE m.empresa_id = :empresaId "
            + "  AND t.cr = false "
            + "  AND EXTRACT(YEAR FROM m.fecha_reg) IN (:anio, :anioAnterior) "
            + sucFilter
            + "GROUP BY mes, anio "
            + "ORDER BY anio, mes";

    var q =
        em.createNativeQuery(sql)
            .setParameter("empresaId", empresaId)
            .setParameter("anio", anio)
            .setParameter("anioAnterior", anioAnterior);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    List<Object[]> rows = q.getResultList();
    return rows.stream()
        .map(r -> new InVentasMesDTO(toInt(r[0]), toInt(r[1]), toLong(r[2]), toBd(r[3])))
        .collect(Collectors.toList());
  }

  // ── topProductos ─────────────────────────────────────────────────────────────

  @Override
  @SuppressWarnings("unchecked")
  public List<InTopProductoDTO> topProductos(
      Integer empresaId, LocalDateTime desde, LocalDateTime hasta, Integer sucursalId, int top) {

    String sucFilter = sucursalId != null ? "AND m.sucursal_id = :sucursalId " : "";

    String sql =
        "SELECT m.producto_id, "
            + "       p.nombre_producto, "
            + "       SUM(ABS(m.cantidad))            AS unidades, "
            + "       COALESCE(SUM(m.costo_total), 0) AS costo_total "
            + "FROM inventario.in_movimientos m "
            + JOIN_TIPOS
            + "JOIN producto.mg_producto p ON p.id = m.producto_id "
            + "WHERE m.empresa_id = :empresaId "
            + "  AND t.cr = false "
            + "  AND m.fecha_reg BETWEEN :desde AND :hasta "
            + sucFilter
            + "GROUP BY m.producto_id, p.nombre_producto "
            + "ORDER BY unidades DESC "
            + "LIMIT :top";

    var q =
        em.createNativeQuery(sql)
            .setParameter("empresaId", empresaId)
            .setParameter("desde", desde)
            .setParameter("hasta", hasta)
            .setParameter("top", top);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    List<Object[]> rows = q.getResultList();
    return rows.stream()
        .map(r -> new InTopProductoDTO(toInt(r[0]), (String) r[1], toLong(r[2]), toBd(r[3])))
        .collect(Collectors.toList());
  }

  // ── ventasPorSemana ──────────────────────────────────────────────────────────

  @Override
  @SuppressWarnings("unchecked")
  public List<InVentasSemanaDTO> ventasPorSemana(
      Integer empresaId, LocalDateTime desde, LocalDateTime hasta, Integer sucursalId) {

    String sucFilter = sucursalId != null ? "AND m.sucursal_id = :sucursalId " : "";

    String sql =
        "SELECT EXTRACT(WEEK FROM m.fecha_reg)::INT  AS semana, "
            + "       EXTRACT(YEAR FROM m.fecha_reg)::INT  AS anio, "
            + "       SUM(ABS(m.cantidad))                 AS unidades, "
            + "       COALESCE(SUM(m.costo_total), 0)      AS costo_total "
            + "FROM inventario.in_movimientos m "
            + JOIN_TIPOS
            + "WHERE m.empresa_id = :empresaId "
            + "  AND t.cr = false "
            + "  AND m.fecha_reg BETWEEN :desde AND :hasta "
            + sucFilter
            + "GROUP BY semana, anio "
            + "ORDER BY anio, semana";

    var q =
        em.createNativeQuery(sql)
            .setParameter("empresaId", empresaId)
            .setParameter("desde", desde)
            .setParameter("hasta", hasta);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    List<Object[]> rows = q.getResultList();
    return rows.stream()
        .map(r -> new InVentasSemanaDTO(toInt(r[0]), toInt(r[1]), toLong(r[2]), toBd(r[3])))
        .collect(Collectors.toList());
  }

  // ── ventasPorSucursal ────────────────────────────────────────────────────────

  @Override
  @SuppressWarnings("unchecked")
  public List<InVentasSucursalDTO> ventasPorSucursal(
      Integer empresaId, LocalDateTime desde, LocalDateTime hasta) {

    String sql =
        "SELECT m.sucursal_id, "
            + "       s.nombre                            AS sucursal_nombre, "
            + "       SUM(ABS(m.cantidad))                AS unidades, "
            + "       COALESCE(SUM(m.costo_total), 0)     AS costo_total "
            + "FROM inventario.in_movimientos m "
            + JOIN_TIPOS
            + "JOIN seguridad.sg_sucursal s ON s.id = m.sucursal_id "
            + "WHERE m.empresa_id = :empresaId "
            + "  AND t.cr = false "
            + "  AND m.fecha_reg BETWEEN :desde AND :hasta "
            + "GROUP BY m.sucursal_id, s.nombre "
            + "ORDER BY unidades DESC";

    List<Object[]> rows =
        em.createNativeQuery(sql)
            .setParameter("empresaId", empresaId)
            .setParameter("desde", desde)
            .setParameter("hasta", hasta)
            .getResultList();

    return rows.stream()
        .map(r -> new InVentasSucursalDTO(toInt(r[0]), (String) r[1], toLong(r[2]), toBd(r[3])))
        .collect(Collectors.toList());
  }

  // ── historicoProducto ────────────────────────────────────────────────────────

  @Override
  @SuppressWarnings("unchecked")
  public List<InVentasMesDTO> historicoProducto(
      Integer empresaId,
      Integer productoId,
      LocalDateTime desde,
      LocalDateTime hasta,
      Integer sucursalId) {

    String sucFilter = sucursalId != null ? "AND m.sucursal_id = :sucursalId " : "";

    String sql =
        "SELECT EXTRACT(MONTH FROM m.fecha_reg)::INT AS mes, "
            + "       EXTRACT(YEAR  FROM m.fecha_reg)::INT AS anio, "
            + "       SUM(ABS(m.cantidad))              AS unidades, "
            + "       COALESCE(SUM(m.costo_total), 0)   AS costo_total "
            + "FROM inventario.in_movimientos m "
            + JOIN_TIPOS
            + "WHERE m.empresa_id = :empresaId "
            + "  AND m.producto_id = :productoId "
            + "  AND t.cr = false "
            + "  AND m.fecha_reg BETWEEN :desde AND :hasta "
            + sucFilter
            + "GROUP BY mes, anio "
            + "ORDER BY anio, mes";

    var q =
        em.createNativeQuery(sql)
            .setParameter("empresaId", empresaId)
            .setParameter("productoId", productoId)
            .setParameter("desde", desde)
            .setParameter("hasta", hasta);
    if (sucursalId != null) q.setParameter("sucursalId", sucursalId);

    List<Object[]> rows = q.getResultList();
    return rows.stream()
        .map(r -> new InVentasMesDTO(toInt(r[0]), toInt(r[1]), toLong(r[2]), toBd(r[3])))
        .collect(Collectors.toList());
  }
}
