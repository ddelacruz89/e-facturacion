package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
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
public class InOrdenEntradaDaoImpl implements InOrdenEntradaDao {
  @PersistenceContext private EntityManager entityManager;

  @Override
  @Transactional
  public InOrdenEntrada save(InOrdenEntrada ordenEntrada) {
    if (ordenEntrada.getId() == null) {
      entityManager.persist(ordenEntrada);
      return ordenEntrada;
    } else {
      return entityManager.merge(ordenEntrada);
    }
  }

  @Override
  public Optional<InOrdenEntrada> findById(Integer id, Integer empresaId) {
    TypedQuery<InOrdenEntrada> query =
        entityManager.createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.id = :id AND o.empresaId = :empresaId",
            InOrdenEntrada.class);
    query.setParameter("id", id);
    query.setParameter("empresaId", empresaId);
    List<InOrdenEntrada> result = query.getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public Optional<InOrdenEntrada> findById(Integer id, Integer empresaId, Integer sucursalId) {
    TypedQuery<InOrdenEntrada> query =
        entityManager.createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.id = :id AND o.empresaId = :empresaId AND o.sucursalId.id = :sucursalId",
            InOrdenEntrada.class);
    query.setParameter("id", id);
    query.setParameter("empresaId", empresaId);
    query.setParameter("sucursalId", sucursalId);
    List<InOrdenEntrada> result = query.getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public List<InOrdenEntrada> findAll(Integer empresaId) {
    return entityManager
        .createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.empresaId = :empresaId", InOrdenEntrada.class)
        .setParameter("empresaId", empresaId)
        .getResultList();
  }

  @Override
  public List<InOrdenEntrada> findAll(Integer empresaId, Integer sucursalId) {
    return entityManager
        .createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.empresaId = :empresaId AND o.sucursalId.id = :sucursalId",
            InOrdenEntrada.class)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }

  @Override
  @Transactional
  public void disableById(Integer id, Integer empresaId) {
    Optional<InOrdenEntrada> ordenEntradaOpt = findById(id, empresaId);
    if (ordenEntradaOpt.isPresent()) {
      InOrdenEntrada ordenEntrada = ordenEntradaOpt.get();
      ordenEntrada.setEstadoId("INA");
      entityManager.merge(ordenEntrada);
    }
  }

  @Override
  public Page<InOrdenEntradaResumenDTO> searchByCriteria(
      InOrdenEntradaSearchCriteria criteria, Integer empresaId) {

    List<String> conditions = new ArrayList<>();
    conditions.add("o.empresaId = :empresaId");

    if (criteria.getId() != null) conditions.add("o.id = :id");
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank())
      conditions.add("o.estadoId = :estadoId");
    if (criteria.getFechaInicio() != null) conditions.add("o.fechaReg >= :fechaInicio");
    if (criteria.getFechaFin() != null) conditions.add("o.fechaReg <= :fechaFin");

    String where = "WHERE " + String.join(" AND ", conditions);
    String select =
        "SELECT new com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO("
            + "o.id, o.fechaReg, "
            + "(SELECT a.nombre FROM InAlmacen a WHERE a.id = o.almacenId), "
            + "o.total, o.usuarioReg, o.estadoId) ";
    String jpql = select + "FROM InOrdenEntrada o " + where + " ORDER BY o.fechaReg DESC";
    String countJpql = "SELECT COUNT(o) FROM InOrdenEntrada o " + where;

    TypedQuery<InOrdenEntradaResumenDTO> query =
        entityManager.createQuery(jpql, InOrdenEntradaResumenDTO.class);
    TypedQuery<Long> countQuery = entityManager.createQuery(countJpql, Long.class);

    query.setParameter("empresaId", empresaId);
    countQuery.setParameter("empresaId", empresaId);
    if (criteria.getId() != null) {
      query.setParameter("id", criteria.getId());
      countQuery.setParameter("id", criteria.getId());
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      query.setParameter("estadoId", criteria.getEstadoId());
      countQuery.setParameter("estadoId", criteria.getEstadoId());
    }
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

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 10;
    query.setFirstResult(page * size);
    query.setMaxResults(size);

    List<InOrdenEntradaResumenDTO> results = query.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(results, PageRequest.of(page, size), total);
  }

  @Override
  @Transactional
  public void disableById(Integer id, Integer empresaId, Integer sucursalId) {
    Optional<InOrdenEntrada> ordenEntradaOpt = findById(id, empresaId, sucursalId);
    if (ordenEntradaOpt.isPresent()) {
      InOrdenEntrada ordenEntrada = ordenEntradaOpt.get();
      ordenEntrada.setEstadoId("INA");
      entityManager.merge(ordenEntrada);
    }
  }
}
