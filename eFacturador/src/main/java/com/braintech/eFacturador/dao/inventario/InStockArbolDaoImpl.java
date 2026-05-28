package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockCriticoDTO;
import com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InStockArbolDaoImpl implements InStockArbolDao {

  @PersistenceContext private EntityManager em;

  // ── Nivel 1: productos ────────────────────────────────────────────────────

  @Override
  @Transactional(readOnly = true)
  public Page<InStockProductoNodoDTO> findProductos(
      Integer empresaId, InStockArbolSearchCriteria criteria) {

    StringBuilder where = new StringBuilder("WHERE i.empresaId = :empresaId ");
    String productoNombre = prepareNombreParam(criteria, where);
    if (criteria.getSucursalId() != null) where.append("AND i.sucursalId.id = :sucursalId ");
    if (criteria.getAlmacenId() != null) where.append("AND i.almacenId.id = :almacenId ");
    if (criteria.isSoloConStock()) where.append("AND i.cantidad > 0 ");

    // Count de productos distintos que coinciden con los filtros
    String countJpql =
        "SELECT COUNT(DISTINCT p.id) FROM InInventario i JOIN i.productoId p " + where;
    TypedQuery<Long> countQ = em.createQuery(countJpql, Long.class);
    bindCommon(countQ, empresaId, criteria, productoNombre);
    long total = countQ.getSingleResult();

    // Datos paginados
    String jpql =
        "SELECT new com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO("
            + "p.id, p.nombreProducto, SUM(i.cantidad), MIN(i.estadoProductoInventario)) "
            + "FROM InInventario i JOIN i.productoId p "
            + where
            + "GROUP BY p.id, p.nombreProducto "
            + "ORDER BY p.nombreProducto ASC";

    TypedQuery<InStockProductoNodoDTO> q = em.createQuery(jpql, InStockProductoNodoDTO.class);
    bindCommon(q, empresaId, criteria, productoNombre);

    int page = Math.max(0, criteria.getPage());
    int size = criteria.getSize() > 0 ? criteria.getSize() : 15;
    q.setFirstResult(page * size);
    q.setMaxResults(size);

    return new PageImpl<>(q.getResultList(), PageRequest.of(page, size), total);
  }

  // ── Nivel 2: almacenes de un producto ─────────────────────────────────────

  @Override
  @Transactional(readOnly = true)
  public List<InStockAlmacenNodoDTO> findAlmacenesPorProducto(
      Integer empresaId, Integer productoId, InStockArbolSearchCriteria criteria) {

    StringBuilder where =
        new StringBuilder("WHERE i.empresaId = :empresaId AND i.productoId.id = :productoId ");
    if (criteria.getSucursalId() != null) where.append("AND i.sucursalId.id = :sucursalId ");
    if (criteria.isSoloConStock()) where.append("AND i.cantidad > 0 ");

    String jpql =
        "SELECT new com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO("
            + "a.id, a.nombre, SUM(i.cantidad), MAX(i.estadoProductoInventario)) "
            + "FROM InInventario i JOIN i.almacenId a "
            + where
            + "GROUP BY a.id, a.nombre "
            + "ORDER BY a.nombre ASC";

    TypedQuery<InStockAlmacenNodoDTO> q = em.createQuery(jpql, InStockAlmacenNodoDTO.class);

    q.setParameter("empresaId", empresaId);
    q.setParameter("productoId", productoId);
    if (criteria.getSucursalId() != null) q.setParameter("sucursalId", criteria.getSucursalId());

    return q.getResultList();
  }

  // ── Nivel 3: lotes de un producto en un almacén ───────────────────────────

  @Override
  @Transactional(readOnly = true)
  public List<InStockLoteNodoDTO> findLotesPorProductoAlmacen(
      Integer empresaId,
      Integer productoId,
      Integer almacenId,
      InStockArbolSearchCriteria criteria) {

    StringBuilder where =
        new StringBuilder(
            "WHERE i.empresaId = :empresaId "
                + "AND i.productoId.id = :productoId "
                + "AND i.almacenId.id = :almacenId ");
    if (criteria.getSucursalId() != null) where.append("AND i.sucursalId.id = :sucursalId ");
    if (criteria.isSoloConStock()) where.append("AND i.cantidad > 0 ");

    String jpql =
        "SELECT new com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO("
            + "i.loteId, SUM(i.cantidad)) "
            + "FROM InInventario i "
            + where
            + "GROUP BY i.loteId "
            + "ORDER BY i.loteId ASC NULLS FIRST";

    TypedQuery<InStockLoteNodoDTO> q = em.createQuery(jpql, InStockLoteNodoDTO.class);

    q.setParameter("empresaId", empresaId);
    q.setParameter("productoId", productoId);
    q.setParameter("almacenId", almacenId);
    if (criteria.getSucursalId() != null) q.setParameter("sucursalId", criteria.getSucursalId());

    return q.getResultList();
  }

  // ── Stock crítico ─────────────────────────────────────────────────────────

  /**
   * Lista plana de producto-almacén cuyo stock total está por debajo del límite configurado. Usa
   * native query para poder hacer el join por mg_producto_unidad_suplidor sin navegación JPQL.
   */
  @Override
  @Transactional(readOnly = true)
  public List<InStockCriticoDTO> findStockCritico(Integer empresaId) {
    @SuppressWarnings("unchecked")
    List<Object[]> rows =
        em.createNativeQuery(
                """
                SELECT
                    p.id          AS productoId,
                    p.nombre_producto AS productoNombre,
                    a.id          AS almacenId,
                    a.nombre      AS almacenNombre,
                    COALESCE(SUM(i.cantidad), 0) AS cantidadActual,
                    MAX(pal.limite) AS limite
                FROM producto.mg_producto_almacen_limite pal
                JOIN producto.mg_producto_unidad_suplidor pus
                    ON pus.id = pal.producto_unidad_suplidor_id
                JOIN producto.mg_producto p
                    ON p.id = pus.producto_id
                JOIN inventario.in_almacen a
                    ON a.id = pal.almacen_id
                   AND a.empresa_id = :empresaId
                LEFT JOIN inventario.in_inventarios i
                    ON i.producto_id = pus.producto_id
                   AND i.almacen_id  = pal.almacen_id
                   AND i.empresa_id  = :empresaId
                WHERE pal.empresa_id = :empresaId
                GROUP BY p.id, p.nombre_producto, a.id, a.nombre
                HAVING COALESCE(SUM(i.cantidad), 0) < MAX(pal.limite)
                ORDER BY p.nombre_producto, a.nombre
                """)
            .setParameter("empresaId", empresaId)
            .getResultList();

    List<InStockCriticoDTO> result = new ArrayList<>();
    for (Object[] r : rows) {
      Integer productoId = toInt(r[0]);
      String productoNombre = (String) r[1];
      Integer almacenId = toInt(r[2]);
      String almacenNombre = (String) r[3];
      Integer cantidadActual = toInt(r[4]);
      Integer limite = toInt(r[5]);
      Integer faltante = (limite != null && cantidadActual != null) ? limite - cantidadActual : 0;
      result.add(
          new InStockCriticoDTO(
              productoId,
              productoNombre,
              almacenId,
              almacenNombre,
              cantidadActual,
              limite,
              faltante));
    }
    return result;
  }

  private static Integer toInt(Object val) {
    if (val == null) return null;
    if (val instanceof Integer i) return i;
    if (val instanceof Long l) return l.intValue();
    if (val instanceof BigInteger bi) return bi.intValue();
    if (val instanceof Number n) return n.intValue();
    return null;
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  /**
   * Prepara el parámetro de nombre de producto (like) y lo agrega al WHERE si aplica. Retorna el
   * valor listo para bind, o null si no hay filtro de nombre.
   */
  private String prepareNombreParam(InStockArbolSearchCriteria criteria, StringBuilder where) {
    if (criteria.getProductoNombre() != null && !criteria.getProductoNombre().isBlank()) {
      where.append("AND LOWER(p.nombreProducto) LIKE :productoNombre ");
      return "%" + criteria.getProductoNombre().trim().toLowerCase(Locale.ROOT) + "%";
    }
    return null;
  }

  /** Bind de parámetros comunes a las queries de nivel 1. */
  private void bindCommon(
      TypedQuery<?> q,
      Integer empresaId,
      InStockArbolSearchCriteria criteria,
      String productoNombre) {
    q.setParameter("empresaId", empresaId);
    if (criteria.getSucursalId() != null) q.setParameter("sucursalId", criteria.getSucursalId());
    if (criteria.getAlmacenId() != null) q.setParameter("almacenId", criteria.getAlmacenId());
    if (productoNombre != null) q.setParameter("productoNombre", productoNombre);
  }
}
