package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InRequisicionResumenDTO;
import com.braintech.eFacturador.dto.inventario.InRequisicionSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
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
public class InRequisicionDaoImpl implements InRequisicionDao {

  @PersistenceContext private EntityManager entityManager;

  @Override
  @Transactional
  public InRequisicion save(InRequisicion requisicion) {
    if (requisicion.getId() == null) {
      entityManager.persist(requisicion);
      return requisicion;
    } else {
      return entityManager.merge(requisicion);
    }
  }

  @Override
  public Optional<InRequisicion> findById(Integer id, Integer empresaId) {
    List<InRequisicion> result =
        entityManager
            .createQuery(
                "SELECT r FROM InRequisicion r WHERE r.id = :id AND r.empresaId = :empresaId",
                InRequisicion.class)
            .setParameter("id", id)
            .setParameter("empresaId", empresaId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public List<InRequisicion> findAll(Integer empresaId) {
    return entityManager
        .createQuery(
            "SELECT r FROM InRequisicion r WHERE r.empresaId = :empresaId ORDER BY r.fechaReg DESC",
            InRequisicion.class)
        .setParameter("empresaId", empresaId)
        .getResultList();
  }

  @Override
  @Transactional
  public void disableById(Integer id, Integer empresaId) {
    findById(id, empresaId)
        .ifPresent(
            r -> {
              r.setEstadoId("ANU");
              entityManager.merge(r);
            });
  }

  @Override
  public Page<InRequisicionResumenDTO> searchByCriteria(
      InRequisicionSearchCriteria criteria, Integer empresaId) {

    List<String> conditions = new ArrayList<>();
    conditions.add("r.empresaId = :empresaId");

    if (criteria.getFechaInicio() != null) conditions.add("r.fechaReg >= :fechaInicio");
    if (criteria.getFechaFin() != null) conditions.add("r.fechaReg <= :fechaFin");
    if (criteria.getAlmacenSolicitanteId() != null)
      conditions.add("r.almacenSolicitanteId = :almacenSolicitanteId");
    if (criteria.getAlmacenOrigenId() != null)
      conditions.add("r.almacenOrigenId = :almacenOrigenId");
    if (criteria.getPrioridad() != null && !criteria.getPrioridad().isBlank())
      conditions.add("r.prioridad = :prioridad");
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank())
      conditions.add("r.estadoId = :estadoId");

    String where = "WHERE " + String.join(" AND ", conditions);

    String select =
        "SELECT new com.braintech.eFacturador.dto.inventario.InRequisicionResumenDTO("
            + "r.id, r.secuencia, r.fechaReg, "
            + "(SELECT a.nombre FROM InAlmacen a WHERE a.id = r.almacenSolicitanteId), "
            + "(SELECT a.nombre FROM InAlmacen a WHERE a.id = r.almacenOrigenId), "
            + "r.prioridad, r.usuarioReg, r.estadoId) ";

    String jpql =
        select
            + "FROM InRequisicion r "
            + where
            + " ORDER BY CASE WHEN r.prioridad = 'ALTA' THEN 1 WHEN r.prioridad = 'MEDIA' THEN 2 ELSE 3 END ASC, r.fechaReg DESC";
    String countJpql = "SELECT COUNT(r) FROM InRequisicion r " + where;

    TypedQuery<InRequisicionResumenDTO> query =
        entityManager.createQuery(jpql, InRequisicionResumenDTO.class);
    TypedQuery<Long> countQuery = entityManager.createQuery(countJpql, Long.class);

    query.setParameter("empresaId", empresaId);
    countQuery.setParameter("empresaId", empresaId);

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
    if (criteria.getAlmacenSolicitanteId() != null) {
      query.setParameter("almacenSolicitanteId", criteria.getAlmacenSolicitanteId());
      countQuery.setParameter("almacenSolicitanteId", criteria.getAlmacenSolicitanteId());
    }
    if (criteria.getAlmacenOrigenId() != null) {
      query.setParameter("almacenOrigenId", criteria.getAlmacenOrigenId());
      countQuery.setParameter("almacenOrigenId", criteria.getAlmacenOrigenId());
    }
    if (criteria.getPrioridad() != null && !criteria.getPrioridad().isBlank()) {
      query.setParameter("prioridad", criteria.getPrioridad());
      countQuery.setParameter("prioridad", criteria.getPrioridad());
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      query.setParameter("estadoId", criteria.getEstadoId());
      countQuery.setParameter("estadoId", criteria.getEstadoId());
    }

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 10;
    query.setFirstResult(page * size);
    query.setMaxResults(size);

    List<InRequisicionResumenDTO> results = query.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(results, PageRequest.of(page, size), total);
  }
}
