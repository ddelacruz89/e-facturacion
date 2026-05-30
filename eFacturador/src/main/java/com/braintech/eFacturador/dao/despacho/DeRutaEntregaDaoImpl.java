package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaSearchCriteria;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class DeRutaEntregaDaoImpl implements DeRutaEntregaDao {

  @PersistenceContext private EntityManager entityManager;

  @Override
  @Transactional
  public DeRutaEntrega save(DeRutaEntrega ruta) {
    if (ruta.getId() == null) {
      entityManager.persist(ruta);
      return ruta;
    } else {
      return entityManager.merge(ruta);
    }
  }

  @Override
  public Optional<DeRutaEntrega> findById(Integer id, Integer empresaId) {
    List<DeRutaEntrega> result =
        entityManager
            .createQuery(
                "SELECT r FROM DeRutaEntrega r WHERE r.id = :id AND r.empresaId = :empresaId",
                DeRutaEntrega.class)
            .setParameter("id", id)
            .setParameter("empresaId", empresaId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
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
  public Page<DeRutaEntregaResumenDTO> searchByCriteria(
      DeRutaEntregaSearchCriteria criteria, Integer empresaId, Integer sucursalId) {

    List<String> conditions = new ArrayList<>();
    conditions.add("r.empresaId = :empresaId");
    conditions.add("r.sucursalId.id = :sucursalId");

    if (criteria.getFechaInicio() != null) conditions.add("r.fecha >= :fechaInicio");
    if (criteria.getFechaFin() != null) conditions.add("r.fecha <= :fechaFin");
    if (criteria.getConductorUsername() != null && !criteria.getConductorUsername().isBlank())
      conditions.add("LOWER(r.conductorUsername) LIKE :conductor");
    if (criteria.getVehiculoId() != null) conditions.add("r.vehiculoId = :vehiculoId");
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank())
      conditions.add("r.estadoId = :estadoId");

    String where = "WHERE " + String.join(" AND ", conditions);

    String select =
        "SELECT new com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO("
            + "r.id, r.secuencia, r.fechaReg, r.fecha, "
            + "(SELECT v.descripcion FROM DeVehiculo v WHERE v.id = r.vehiculoId), "
            + "(SELECT v.placa FROM DeVehiculo v WHERE v.id = r.vehiculoId), "
            + "r.conductorUsername, "
            + "(SELECT COUNT(o) FROM DeOrdenDespacho o WHERE o.rutaId = r.id), "
            + "r.estadoId, r.usuarioReg) ";

    String jpql =
        select + "FROM DeRutaEntrega r " + where + " ORDER BY r.fecha DESC, r.fechaReg DESC";
    String countJpql = "SELECT COUNT(r) FROM DeRutaEntrega r " + where;

    TypedQuery<DeRutaEntregaResumenDTO> query =
        entityManager.createQuery(jpql, DeRutaEntregaResumenDTO.class);
    TypedQuery<Long> countQuery = entityManager.createQuery(countJpql, Long.class);

    query.setParameter("empresaId", empresaId);
    query.setParameter("sucursalId", sucursalId);
    countQuery.setParameter("empresaId", empresaId);
    countQuery.setParameter("sucursalId", sucursalId);

    if (criteria.getFechaInicio() != null) {
      query.setParameter("fechaInicio", criteria.getFechaInicio());
      countQuery.setParameter("fechaInicio", criteria.getFechaInicio());
    }
    if (criteria.getFechaFin() != null) {
      query.setParameter("fechaFin", criteria.getFechaFin());
      countQuery.setParameter("fechaFin", criteria.getFechaFin());
    }
    if (criteria.getConductorUsername() != null && !criteria.getConductorUsername().isBlank()) {
      query.setParameter("conductor", "%" + criteria.getConductorUsername().toLowerCase() + "%");
      countQuery.setParameter(
          "conductor", "%" + criteria.getConductorUsername().toLowerCase() + "%");
    }
    if (criteria.getVehiculoId() != null) {
      query.setParameter("vehiculoId", criteria.getVehiculoId());
      countQuery.setParameter("vehiculoId", criteria.getVehiculoId());
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      query.setParameter("estadoId", criteria.getEstadoId());
      countQuery.setParameter("estadoId", criteria.getEstadoId());
    }

    int page = criteria.getPage();
    int size = criteria.getSize();
    query.setFirstResult(page * size);
    query.setMaxResults(size);

    List<DeRutaEntregaResumenDTO> results = query.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(results, PageRequest.of(page, size), total);
  }

  @Override
  public List<DeRutaEntrega> findByFechaAndConductor(
      LocalDate fecha, String conductorUsername, Integer empresaId) {
    return entityManager
        .createQuery(
            "SELECT r FROM DeRutaEntrega r "
                + "WHERE r.empresaId = :empresaId "
                + "AND r.conductorUsername = :conductorUsername "
                + "AND r.fecha = :fecha "
                + "AND r.estadoId <> 'ANU' "
                + "ORDER BY r.fechaReg ASC",
            DeRutaEntrega.class)
        .setParameter("empresaId", empresaId)
        .setParameter("conductorUsername", conductorUsername)
        .setParameter("fecha", fecha)
        .getResultList();
  }
}
