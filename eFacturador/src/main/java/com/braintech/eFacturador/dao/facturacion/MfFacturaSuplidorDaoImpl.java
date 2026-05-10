package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorSearchCriteria;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MfFacturaSuplidorDaoImpl implements MfFacturaSuplidorDao {

  private final EntityManager em;

  @Override
  public List<MfFacturaSuplidorResumenDTO> buscar(
      Integer empresaId, MfFacturaSuplidorSearchCriteria criteria) {

    StringBuilder jpql =
        new StringBuilder(
            "SELECT new com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO("
                + "  f.id, f.fechaReg,"
                + "  (SELECT s.nombre FROM InSuplidor s WHERE s.id = f.suplidor.id),"
                + "  f.numeroFactura, f.ncf, f.total, f.estadoId, f.usuarioReg"
                + ") "
                + "FROM MfFacturaSuplidor f "
                + "WHERE f.empresaId = :empresaId ");

    if (criteria.getSucursalId() != null) {
      jpql.append("AND f.sucursalId = :sucursalId ");
    }
    if (criteria.getSuplidorId() != null) {
      jpql.append("AND f.suplidor.id = :suplidorId ");
    }
    if (criteria.getNumeroFactura() != null && !criteria.getNumeroFactura().isBlank()) {
      jpql.append("AND LOWER(f.numeroFactura) LIKE :numeroFactura ");
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      jpql.append("AND f.estadoId = :estadoId ");
    }
    if (criteria.getFechaInicio() != null) {
      jpql.append("AND f.fechaReg >= :fechaInicio ");
    }
    if (criteria.getFechaFin() != null) {
      jpql.append("AND f.fechaReg <= :fechaFin ");
    }

    jpql.append("ORDER BY f.fechaReg DESC");

    TypedQuery<MfFacturaSuplidorResumenDTO> query =
        em.createQuery(jpql.toString(), MfFacturaSuplidorResumenDTO.class);

    query.setParameter("empresaId", empresaId);

    if (criteria.getSucursalId() != null) {
      query.setParameter("sucursalId", criteria.getSucursalId());
    }
    if (criteria.getSuplidorId() != null) {
      query.setParameter("suplidorId", criteria.getSuplidorId());
    }
    if (criteria.getNumeroFactura() != null && !criteria.getNumeroFactura().isBlank()) {
      query.setParameter("numeroFactura", "%" + criteria.getNumeroFactura().toLowerCase() + "%");
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      query.setParameter("estadoId", criteria.getEstadoId());
    }
    if (criteria.getFechaInicio() != null) {
      query.setParameter("fechaInicio", criteria.getFechaInicio().atStartOfDay());
    }
    if (criteria.getFechaFin() != null) {
      query.setParameter(
          "fechaFin", LocalDateTime.of(criteria.getFechaFin(), LocalTime.MAX));
    }

    return query.getResultList();
  }
}
