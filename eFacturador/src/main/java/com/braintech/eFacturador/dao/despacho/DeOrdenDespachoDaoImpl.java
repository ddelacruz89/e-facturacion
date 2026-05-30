package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoSearchCriteria;
import com.braintech.eFacturador.dto.despacho.MisEntregasOrdenDTO;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalDate;
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
public class DeOrdenDespachoDaoImpl implements DeOrdenDespachoDao {

  @PersistenceContext private EntityManager entityManager;

  @Override
  @Transactional
  public DeOrdenDespacho save(DeOrdenDespacho orden) {
    if (orden.getId() == null) {
      entityManager.persist(orden);
      return orden;
    } else {
      return entityManager.merge(orden);
    }
  }

  @Override
  public Optional<DeOrdenDespacho> findById(Integer id, Integer empresaId) {
    List<DeOrdenDespacho> result =
        entityManager
            .createQuery(
                "SELECT o FROM DeOrdenDespacho o WHERE o.id = :id AND o.empresaId = :empresaId",
                DeOrdenDespacho.class)
            .setParameter("id", id)
            .setParameter("empresaId", empresaId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public boolean existsByFacturaId(Integer facturaId, Integer empresaId) {
    Long count =
        entityManager
            .createQuery(
                "SELECT COUNT(o) FROM DeOrdenDespacho o "
                    + "WHERE o.facturaId = :facturaId AND o.empresaId = :empresaId "
                    + "AND o.estadoId <> 'ANU'",
                Long.class)
            .setParameter("facturaId", facturaId)
            .setParameter("empresaId", empresaId)
            .getSingleResult();
    return count > 0;
  }

  @Override
  @Transactional
  public void disableById(Integer id, Integer empresaId) {
    findById(id, empresaId)
        .ifPresent(
            o -> {
              o.setEstadoId("ANU");
              entityManager.merge(o);
            });
  }

  @Override
  public Page<DeOrdenDespachoResumenDTO> searchByCriteria(
      DeOrdenDespachoSearchCriteria criteria, Integer empresaId, Integer sucursalId) {

    List<String> conditions = new ArrayList<>();
    conditions.add("o.empresaId = :empresaId");
    conditions.add("o.sucursalId.id = :sucursalId");

    if (criteria.getFechaInicio() != null) conditions.add("o.fechaReg >= :fechaInicio");
    if (criteria.getFechaFin() != null) conditions.add("o.fechaReg <= :fechaFin");
    if (criteria.getFacturaSecuencia() != null)
      conditions.add("o.facturaSecuencia = :facturaSecuencia");
    if (criteria.getClienteNombre() != null && !criteria.getClienteNombre().isBlank())
      conditions.add("LOWER(o.clienteNombre) LIKE :clienteNombre");
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank())
      conditions.add("o.estadoId = :estadoId");
    if (criteria.getRutaId() != null) conditions.add("o.rutaId = :rutaId");

    String where = "WHERE " + String.join(" AND ", conditions);

    String select =
        "SELECT new com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO("
            + "o.id, o.secuencia, o.fechaReg, o.facturaSecuencia, o.clienteNombre, "
            + "o.fechaCompromiso, "
            + "(SELECT r.conductorUsername FROM DeRutaEntrega r WHERE r.id = o.rutaId), "
            + "o.estadoId, o.usuarioReg) ";

    String jpql = select + "FROM DeOrdenDespacho o " + where + " ORDER BY o.fechaCompromiso ASC";
    String countJpql = "SELECT COUNT(o) FROM DeOrdenDespacho o " + where;

    TypedQuery<DeOrdenDespachoResumenDTO> query =
        entityManager.createQuery(jpql, DeOrdenDespachoResumenDTO.class);
    TypedQuery<Long> countQuery = entityManager.createQuery(countJpql, Long.class);

    query.setParameter("empresaId", empresaId);
    query.setParameter("sucursalId", sucursalId);
    countQuery.setParameter("empresaId", empresaId);
    countQuery.setParameter("sucursalId", sucursalId);

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
    if (criteria.getFacturaSecuencia() != null) {
      query.setParameter("facturaSecuencia", criteria.getFacturaSecuencia());
      countQuery.setParameter("facturaSecuencia", criteria.getFacturaSecuencia());
    }
    if (criteria.getClienteNombre() != null && !criteria.getClienteNombre().isBlank()) {
      query.setParameter("clienteNombre", "%" + criteria.getClienteNombre().toLowerCase() + "%");
      countQuery.setParameter(
          "clienteNombre", "%" + criteria.getClienteNombre().toLowerCase() + "%");
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      query.setParameter("estadoId", criteria.getEstadoId());
      countQuery.setParameter("estadoId", criteria.getEstadoId());
    }
    if (criteria.getRutaId() != null) {
      query.setParameter("rutaId", criteria.getRutaId());
      countQuery.setParameter("rutaId", criteria.getRutaId());
    }

    int page = criteria.getPage();
    int size = criteria.getSize();
    query.setFirstResult(page * size);
    query.setMaxResults(size);

    List<DeOrdenDespachoResumenDTO> results = query.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(results, PageRequest.of(page, size), total);
  }

  @Override
  public List<MisEntregasOrdenDTO> findOrdenesByRutaId(Integer rutaId, Integer empresaId) {
    return entityManager
        .createQuery(
            "SELECT new com.braintech.eFacturador.dto.despacho.MisEntregasOrdenDTO("
                + "o.id, o.secuencia, o.facturaId, o.facturaSecuencia, o.clienteNombre, "
                + "o.clienteTelefono, o.direccionEntrega, o.fechaCompromiso, "
                + "o.fechaEntrega, o.estadoId, o.notas) "
                + "FROM DeOrdenDespacho o "
                + "WHERE o.rutaId = :rutaId AND o.empresaId = :empresaId "
                + "ORDER BY o.fechaCompromiso ASC",
            MisEntregasOrdenDTO.class)
        .setParameter("rutaId", rutaId)
        .setParameter("empresaId", empresaId)
        .getResultList();
  }

  @Override
  public List<DeOrdenDespacho> findPendientesByEmpresaAndSucursal(
      Integer empresaId, Integer sucursalId) {
    return entityManager
        .createQuery(
            "SELECT o FROM DeOrdenDespacho o "
                + "WHERE o.empresaId = :empresaId AND o.sucursalId.id = :sucursalId "
                + "AND o.estadoId = 'PEN' "
                + "ORDER BY o.fechaCompromiso ASC",
            DeOrdenDespacho.class)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }

  @Override
  public List<DeOrdenDespacho> findByRutaId(Integer rutaId, Integer empresaId) {
    return entityManager
        .createQuery(
            "SELECT o FROM DeOrdenDespacho o "
                + "WHERE o.rutaId = :rutaId AND o.empresaId = :empresaId",
            DeOrdenDespacho.class)
        .setParameter("rutaId", rutaId)
        .setParameter("empresaId", empresaId)
        .getResultList();
  }

  @Override
  public List<MisEntregasOrdenDTO> findMisOrdenesDirectas(
      String conductorUsername, LocalDate fecha, Integer empresaId) {
    LocalDateTime desde = fecha.atStartOfDay();
    LocalDateTime hasta = fecha.atTime(LocalTime.MAX);
    return entityManager
        .createQuery(
            "SELECT new com.braintech.eFacturador.dto.despacho.MisEntregasOrdenDTO("
                + "o.id, o.secuencia, o.facturaId, o.facturaSecuencia, o.clienteNombre, "
                + "o.clienteTelefono, o.direccionEntrega, o.fechaCompromiso, "
                + "o.fechaEntrega, o.estadoId, o.notas) "
                + "FROM DeOrdenDespacho o "
                + "WHERE o.empresaId = :empresaId "
                + "AND o.rutaId IS NULL "
                + "AND o.fechaCompromiso BETWEEN :desde AND :hasta "
                + "AND o.estadoId <> 'ANU' "
                + "ORDER BY o.fechaCompromiso ASC",
            MisEntregasOrdenDTO.class)
        .setParameter("empresaId", empresaId)
        .setParameter("desde", desde)
        .setParameter("hasta", hasta)
        .getResultList();
  }
}
