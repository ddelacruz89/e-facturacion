package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
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

    StringBuilder jpql =
        new StringBuilder(
            "SELECT new com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO("
                + "  a.id, a.fechaReg, a.almacenId, a.estadoId,"
                + "  (SELECT t.tipoMovimiento FROM InMovimientoTipo t WHERE t.id = a.movimientoTipoId),"
                + "  a.observacion, a.usuarioReg, SIZE(a.detalles)"
                + ") FROM InAjusteInventario a "
                + "WHERE a.empresaId = :empresaId AND a.sucursalId.id = :sucursalId");

    if (criteria.getFechaInicio() != null) jpql.append(" AND a.fechaReg >= :desde");
    if (criteria.getFechaFin() != null) jpql.append(" AND a.fechaReg <= :hasta");
    if (criteria.getUsuarioReg() != null && !criteria.getUsuarioReg().isBlank())
      jpql.append(" AND LOWER(a.usuarioReg) LIKE :usuario");
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank())
      jpql.append(" AND a.estadoId = :estadoId");
    if (criteria.getMovimientoTipoId() != null)
      jpql.append(" AND a.movimientoTipoId = :movimientoTipoId");

    jpql.append(" ORDER BY a.fechaReg DESC");

    TypedQuery<InAjusteInventarioResumenDTO> query =
        em.createQuery(jpql.toString(), InAjusteInventarioResumenDTO.class)
            .setParameter("empresaId", empresaId)
            .setParameter("sucursalId", sucursalId);

    if (criteria.getFechaInicio() != null)
      query.setParameter("desde", criteria.getFechaInicio().atStartOfDay());
    if (criteria.getFechaFin() != null)
      query.setParameter("hasta", criteria.getFechaFin().atTime(LocalTime.MAX));
    if (criteria.getUsuarioReg() != null && !criteria.getUsuarioReg().isBlank())
      query.setParameter("usuario", "%" + criteria.getUsuarioReg().toLowerCase(Locale.ROOT) + "%");
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank())
      query.setParameter("estadoId", criteria.getEstadoId());
    if (criteria.getMovimientoTipoId() != null)
      query.setParameter("movimientoTipoId", criteria.getMovimientoTipoId());

    int total = query.getResultList().size();
    List<InAjusteInventarioResumenDTO> result =
        query
            .setFirstResult(criteria.getPage() * criteria.getSize())
            .setMaxResults(criteria.getSize())
            .getResultList();

    return new PageImpl<>(result, PageRequest.of(criteria.getPage(), criteria.getSize()), total);
  }
}
