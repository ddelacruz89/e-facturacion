package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InStockArbolFlatDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InStockArbolDaoImpl implements InStockArbolDao {

  @PersistenceContext private EntityManager em;

  private static final String SELECT_ARBOL =
      "SELECT new com.braintech.eFacturador.dto.inventario.InStockArbolFlatDTO("
          + "  p.id, p.nombreProducto, a.id, a.nombre, i.loteId, i.cantidad) "
          + "FROM InInventario i "
          + "  JOIN i.productoId p "
          + "  JOIN i.almacenId a ";

  @Override
  @Transactional(readOnly = true)
  public List<InStockArbolFlatDTO> findStockArbol(
      Integer empresaId, InStockArbolSearchCriteria criteria) {

    // ── WHERE base: empresaId siempre presente (tenant) ──────────────────
    StringBuilder where = new StringBuilder("WHERE i.empresaId = :empresaId ");

    // ── Filtros opcionales: solo se agregan si vienen con valor ──────────
    // sucursalId nulo = mostrar todas las sucursales de la empresa
    if (criteria.getSucursalId() != null) {
      where.append("AND i.sucursalId.id = :sucursalId ");
    }

    // productoNombre: búsqueda parcial case-insensitive
    String productoNombre = null;
    if (criteria.getProductoNombre() != null && !criteria.getProductoNombre().isBlank()) {
      productoNombre = "%" + criteria.getProductoNombre().trim().toLowerCase() + "%";
      where.append("AND LOWER(p.nombreProducto) LIKE :productoNombre ");
    }

    // almacenId nulo = todos los almacenes
    if (criteria.getAlmacenId() != null) {
      where.append("AND a.id = :almacenId ");
    }

    // soloConStock: filtra cantidad > 0 (default true)
    if (criteria.isSoloConStock()) {
      where.append("AND i.cantidad > 0 ");
    }

    String order = "ORDER BY p.nombreProducto ASC, a.nombre ASC, i.loteId ASC NULLS FIRST";

    TypedQuery<InStockArbolFlatDTO> query =
        em.createQuery(SELECT_ARBOL + where + order, InStockArbolFlatDTO.class);

    // ── Bind de parámetros: solo los que están en la query ───────────────
    query.setParameter("empresaId", empresaId);

    if (criteria.getSucursalId() != null) {
      query.setParameter("sucursalId", criteria.getSucursalId());
    }
    if (productoNombre != null) {
      query.setParameter("productoNombre", productoNombre);
    }
    if (criteria.getAlmacenId() != null) {
      query.setParameter("almacenId", criteria.getAlmacenId());
    }

    return query.getResultList();
  }
}
