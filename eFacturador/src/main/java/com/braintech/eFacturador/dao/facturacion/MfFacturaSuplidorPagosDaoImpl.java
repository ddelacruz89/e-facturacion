package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderSearchCriteria;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MfFacturaSuplidorPagosDaoImpl implements MfFacturaSuplidorPagosDao {

  private final EntityManager em;

  @Override
  public List<MfFacturaSuplidorPagosHeaderResumenDTO> buscar(
      Integer empresaId, MfFacturaSuplidorPagosHeaderSearchCriteria criteria) {

    StringBuilder jpql =
        new StringBuilder(
            "SELECT new com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderResumenDTO("
                + "  p.id, p.fechaPago, p.facturaSuplidor.id,"
                + "  (SELECT s.nombre FROM InSuplidor s WHERE s.id = p.facturaSuplidor.suplidor.id),"
                + "  p.monto, p.pagado, p.usuarioReg, p.estadoId"
                + ") "
                + "FROM MfFacturaSuplidorPagosHeader p "
                + "WHERE p.facturaSuplidor.empresaId = :empresaId ");

    if (criteria.getFacturaSuplidorId() != null) {
      jpql.append("AND p.facturaSuplidor.id = :facturaSuplidorId ");
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      jpql.append("AND p.estadoId = :estadoId ");
    }
    if (criteria.getFechaInicio() != null) {
      jpql.append("AND p.fechaPago >= :fechaInicio ");
    }
    if (criteria.getFechaFin() != null) {
      jpql.append("AND p.fechaPago <= :fechaFin ");
    }

    jpql.append("ORDER BY p.fechaPago DESC");

    TypedQuery<MfFacturaSuplidorPagosHeaderResumenDTO> query =
        em.createQuery(jpql.toString(), MfFacturaSuplidorPagosHeaderResumenDTO.class);

    query.setParameter("empresaId", empresaId);

    if (criteria.getFacturaSuplidorId() != null) {
      query.setParameter("facturaSuplidorId", criteria.getFacturaSuplidorId());
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      query.setParameter("estadoId", criteria.getEstadoId());
    }
    if (criteria.getFechaInicio() != null) {
      query.setParameter("fechaInicio", criteria.getFechaInicio().atStartOfDay());
    }
    if (criteria.getFechaFin() != null) {
      query.setParameter("fechaFin", LocalDateTime.of(criteria.getFechaFin(), LocalTime.MAX));
    }

    return query.getResultList();
  }
}
