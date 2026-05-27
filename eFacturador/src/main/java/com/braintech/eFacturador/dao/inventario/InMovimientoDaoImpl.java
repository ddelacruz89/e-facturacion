package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InMovimientoDaoImpl implements InMovimientoDao {

  @PersistenceContext private EntityManager em;

  // ── SELECT fragment compartido por buscar e historial ────────────────────────
  private static final String SELECT_DTO =
      "SELECT new com.braintech.eFacturador.dto.inventario.InMovimientoResumenDTO("
          + "  m.id, m.fechaReg,"
          + "  m.tipoMovimientoId,"
          + "  (SELECT t.tipoMovimiento FROM com.braintech.eFacturador.jpa.inventario.InMovimientoTipo t WHERE t.id = m.tipoMovimientoId),"
          + "  m.numeroReferencia,"
          + "  m.almacenId,"
          + "  (SELECT a.nombre FROM com.braintech.eFacturador.jpa.inventario.InAlmacen a WHERE a.id = m.almacenId),"
          + "  m.productoId,"
          + "  (SELECT p.nombreProducto FROM com.braintech.eFacturador.jpa.producto.MgProducto p WHERE p.id = m.productoId),"
          + "  m.lote, m.cantidad, m.cantidadInventario, m.precioUnitario, m.costoTotal,"
          + "  m.usuarioReg, m.observacion"
          + ") FROM InMovimiento m ";

  @Override
  @Transactional
  public InMovimiento save(InMovimiento movimiento) {
    if (movimiento.getId() == null) {
      em.persist(movimiento);
      em.flush(); // ejecuta el INSERT → el trigger BEFORE INSERT corre y llena cantidad_inventario
      em.refresh(movimiento); // recarga la fila para tener cantidad_inventario en memoria
      return movimiento;
    }
    return em.merge(movimiento);
  }

  @Override
  @Transactional
  public void saveAll(List<InMovimiento> movimientos) {
    for (InMovimiento m : movimientos) {
      if (m.getId() == null) {
        em.persist(m);
      } else {
        em.merge(m);
      }
    }
    em.flush(); // un solo flush al final: el trigger corre para cada fila insertada
    for (InMovimiento m : movimientos) {
      if (m.getId() != null) {
        em.refresh(m); // recarga cantidad_inventario desde la DB para cada movimiento
      }
    }
  }

  @Override
  public Optional<InMovimiento> findById(Integer id, Integer empresaId, Integer sucursalId) {
    List<InMovimiento> result =
        em.createQuery(
                "SELECT m FROM InMovimiento m "
                    + "WHERE m.id = :id AND m.empresaId = :empresaId AND m.sucursalId.id = :sucursalId",
                InMovimiento.class)
            .setParameter("id", id)
            .setParameter("empresaId", empresaId)
            .setParameter("sucursalId", sucursalId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public Page<InMovimientoResumenDTO> searchByCriteria(
      InMovimientoSearchCriteria criteria, Integer empresaId) {

    boolean filtraSucursal = criteria.getSucursalId() != null;

    String whereBase =
        filtraSucursal
            ? "WHERE m.empresaId = :empresaId AND m.sucursalId.id = :sucursalId "
            : "WHERE m.empresaId = :empresaId ";

    List<String> filters = new ArrayList<>();
    if (criteria.getFechaInicio() != null) filters.add("m.fechaReg >= :fechaInicio");
    if (criteria.getFechaFin() != null) filters.add("m.fechaReg <= :fechaFin");
    if (criteria.getAlmacenId() != null) filters.add("m.almacenId = :almacenId");
    if (criteria.getProductoId() != null) filters.add("m.productoId = :productoId");
    if (criteria.getTipoMovimientoId() != null)
      filters.add("m.tipoMovimientoId = :tipoMovimientoId");
    if (criteria.getNumeroReferencia() != null)
      filters.add("m.numeroReferencia = :numeroReferencia");
    if (criteria.getLote() != null && !criteria.getLote().isBlank())
      filters.add("m.lote LIKE :lote");

    String extra = filters.isEmpty() ? "" : "AND " + String.join(" AND ", filters) + " ";
    String order = "ORDER BY m.fechaReg DESC";

    TypedQuery<InMovimientoResumenDTO> query =
        em.createQuery(SELECT_DTO + whereBase + extra + order, InMovimientoResumenDTO.class);
    TypedQuery<Long> countQuery =
        em.createQuery("SELECT COUNT(m) FROM InMovimiento m " + whereBase + extra, Long.class);

    // Params base
    query.setParameter("empresaId", empresaId);
    countQuery.setParameter("empresaId", empresaId);
    if (filtraSucursal) {
      query.setParameter("sucursalId", criteria.getSucursalId());
      countQuery.setParameter("sucursalId", criteria.getSucursalId());
    }

    // Params opcionales
    if (criteria.getFechaInicio() != null) {
      LocalDateTime desde = criteria.getFechaInicio().atStartOfDay();
      query.setParameter("fechaInicio", desde);
      countQuery.setParameter("fechaInicio", desde);
    }
    if (criteria.getFechaFin() != null) {
      LocalDateTime hasta = criteria.getFechaFin().atTime(LocalTime.MAX);
      query.setParameter("fechaFin", hasta);
      countQuery.setParameter("fechaFin", hasta);
    }
    if (criteria.getAlmacenId() != null) {
      query.setParameter("almacenId", criteria.getAlmacenId());
      countQuery.setParameter("almacenId", criteria.getAlmacenId());
    }
    if (criteria.getProductoId() != null) {
      query.setParameter("productoId", criteria.getProductoId());
      countQuery.setParameter("productoId", criteria.getProductoId());
    }
    if (criteria.getTipoMovimientoId() != null) {
      query.setParameter("tipoMovimientoId", criteria.getTipoMovimientoId());
      countQuery.setParameter("tipoMovimientoId", criteria.getTipoMovimientoId());
    }
    if (criteria.getNumeroReferencia() != null) {
      query.setParameter("numeroReferencia", criteria.getNumeroReferencia());
      countQuery.setParameter("numeroReferencia", criteria.getNumeroReferencia());
    }
    if (criteria.getLote() != null && !criteria.getLote().isBlank()) {
      query.setParameter("lote", "%" + criteria.getLote() + "%");
      countQuery.setParameter("lote", "%" + criteria.getLote() + "%");
    }

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 50;
    query.setFirstResult(page * size);
    query.setMaxResults(size);

    List<InMovimientoResumenDTO> content = query.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(content, PageRequest.of(page, size), total);
  }

  @Override
  public List<InMovimientoResumenDTO> findByProductoAndAlmacen(
      Integer productoId, Integer almacenId, Integer empresaId, Integer sucursalId) {

    return em.createQuery(
            SELECT_DTO
                + "WHERE m.productoId = :productoId AND m.almacenId = :almacenId "
                + "  AND m.empresaId = :empresaId AND m.sucursalId.id = :sucursalId "
                + "ORDER BY m.fechaReg DESC",
            InMovimientoResumenDTO.class)
        .setParameter("productoId", productoId)
        .setParameter("almacenId", almacenId)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }
}
