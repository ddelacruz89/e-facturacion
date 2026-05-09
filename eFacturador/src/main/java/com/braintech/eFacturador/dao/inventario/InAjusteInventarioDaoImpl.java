package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InAjusteInventarioDaoImpl implements InAjusteInventarioDao {

  @PersistenceContext private EntityManager em;

  @Override
  @Transactional
  public InAjusteInventario save(InAjusteInventario ajuste) {
    if (ajuste.getId() == null) {
      em.persist(ajuste);
      return ajuste;
    }
    return em.merge(ajuste);
  }

  @Override
  public Optional<InAjusteInventario> findById(Integer id, Integer empresaId, Integer sucursalId) {
    List<InAjusteInventario> result =
        em.createQuery(
                "SELECT a FROM InAjusteInventario a "
                    + "WHERE a.id = :id AND a.empresaId = :empresaId AND a.sucursalId.id = :sucursalId",
                InAjusteInventario.class)
            .setParameter("id", id)
            .setParameter("empresaId", empresaId)
            .setParameter("sucursalId", sucursalId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public List<InAjusteInventarioResumenDTO> findByAlmacen(
      Integer almacenId, Integer empresaId, Integer sucursalId) {
    return em.createQuery(
            "SELECT new com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO("
                + "  a.id, a.fechaReg, a.almacenId, a.estadoId,"
                + "  (SELECT t.tipoMovimiento FROM InMovimientoTipo t WHERE t.id = a.movimientoTipoId),"
                + "  a.observacion, a.usuarioReg, SIZE(a.detalles)"
                + ") FROM InAjusteInventario a "
                + "WHERE a.almacenId = :almacenId "
                + "  AND a.empresaId = :empresaId "
                + "  AND a.sucursalId.id = :sucursalId "
                + "ORDER BY a.fechaReg DESC",
            InAjusteInventarioResumenDTO.class)
        .setParameter("almacenId", almacenId)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }

  @Override
  public Page<InAjusteInventarioResumenDTO> buscar(
      InAjusteInventarioSearchCriteria criteria, Integer empresaId, Integer sucursalId) {

    // ── WHERE dinámico ────────────────────────────────────────────────────────
    StringBuilder where =
        new StringBuilder("WHERE a.empresaId = :empresaId AND a.sucursalId.id = :sucursalId");

    if (criteria.getFechaInicio() != null) {
      where.append(" AND a.fechaReg >= :desde");
    }
    if (criteria.getFechaFin() != null) {
      where.append(" AND a.fechaReg <= :hasta");
    }
    if (criteria.getUsuarioReg() != null && !criteria.getUsuarioReg().isBlank()) {
      where.append(" AND LOWER(a.usuarioReg) LIKE :usuario");
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      where.append(" AND a.estadoId = :estadoId");
    }
    if (criteria.getMovimientoTipoId() != null) {
      where.append(" AND a.movimientoTipoId = :movimientoTipoId");
    }

    String select =
        "SELECT new com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO("
            + "  a.id, a.fechaReg, a.almacenId, a.estadoId,"
            + "  (SELECT t.tipoMovimiento FROM InMovimientoTipo t WHERE t.id = a.movimientoTipoId),"
            + "  a.observacion, a.usuarioReg, SIZE(a.detalles)"
            + ") FROM InAjusteInventario a ";

    String countSelect = "SELECT COUNT(a) FROM InAjusteInventario a ";

    TypedQuery<InAjusteInventarioResumenDTO> dataQuery =
        em.createQuery(
            select + where + " ORDER BY a.fechaReg DESC", InAjusteInventarioResumenDTO.class);
    TypedQuery<Long> countQuery = em.createQuery(countSelect + where, Long.class);

    // ── bind params ──────────────────────────────────────────────────────────
    dataQuery.setParameter("empresaId", empresaId);
    dataQuery.setParameter("sucursalId", sucursalId);
    countQuery.setParameter("empresaId", empresaId);
    countQuery.setParameter("sucursalId", sucursalId);

    if (criteria.getFechaInicio() != null) {
      var desde = criteria.getFechaInicio().atStartOfDay();
      dataQuery.setParameter("desde", desde);
      countQuery.setParameter("desde", desde);
    }
    if (criteria.getFechaFin() != null) {
      var hasta = criteria.getFechaFin().atTime(LocalTime.MAX);
      dataQuery.setParameter("hasta", hasta);
      countQuery.setParameter("hasta", hasta);
    }
    if (criteria.getUsuarioReg() != null && !criteria.getUsuarioReg().isBlank()) {
      String like = "%" + criteria.getUsuarioReg().toLowerCase() + "%";
      dataQuery.setParameter("usuario", like);
      countQuery.setParameter("usuario", like);
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      dataQuery.setParameter("estadoId", criteria.getEstadoId());
      countQuery.setParameter("estadoId", criteria.getEstadoId());
    }
    if (criteria.getMovimientoTipoId() != null) {
      dataQuery.setParameter("movimientoTipoId", criteria.getMovimientoTipoId());
      countQuery.setParameter("movimientoTipoId", criteria.getMovimientoTipoId());
    }

    // ── paginación ───────────────────────────────────────────────────────────
    int page = Math.max(criteria.getPage(), 0);
    int size = criteria.getSize() > 0 ? criteria.getSize() : 20;
    dataQuery.setFirstResult(page * size);
    dataQuery.setMaxResults(size);

    List<InAjusteInventarioResumenDTO> content = dataQuery.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(content, PageRequest.of(page, size), total);
  }
}
