package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InStockArbolDaoImpl implements InStockArbolDao {

  @PersistenceContext private EntityManager em;

  // ── Nivel 1: productos ────────────────────────────────────────────────────

  @Override
  @Transactional(readOnly = true)
  public List<InStockProductoNodoDTO> findProductos(
      Integer empresaId, InStockArbolSearchCriteria criteria) {

    StringBuilder where = new StringBuilder("WHERE i.empresaId = :empresaId ");
    String productoNombre = prepareNombreParam(criteria, where);
    if (criteria.getSucursalId() != null) where.append("AND i.sucursalId.id = :sucursalId ");
    if (criteria.getAlmacenId() != null) where.append("AND i.almacenId.id = :almacenId ");
    if (criteria.isSoloConStock()) where.append("AND i.cantidad > 0 ");

    String jpql =
        "SELECT new com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO("
            + "p.id, p.nombreProducto, SUM(i.cantidad)) "
            + "FROM InInventario i JOIN i.productoId p "
            + where
            + "GROUP BY p.id, p.nombreProducto "
            + "ORDER BY p.nombreProducto ASC";

    TypedQuery<InStockProductoNodoDTO> q = em.createQuery(jpql, InStockProductoNodoDTO.class);

    bindCommon(q, empresaId, criteria, productoNombre);
    return q.getResultList();
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
            + "a.id, a.nombre, SUM(i.cantidad)) "
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
