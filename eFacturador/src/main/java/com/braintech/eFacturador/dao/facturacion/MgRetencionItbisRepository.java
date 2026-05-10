package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisResumenDTO;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgRetencionItbisRepository extends JpaRepository<MgRetencionItbis, Integer> {

  /** Todos los registros, proyectados como resumen (sin las relaciones lazy). */
  @Query(
      "SELECT new com.braintech.eFacturador.dto.facturacion.MgRetencionItbisResumenDTO("
          + "  r.id, r.descripcion, r.valor, r.alTotal, r.tipoRetencion, r.comentarioFactura) "
          + "FROM MgRetencionItbis r "
          + "ORDER BY r.tipoRetencion ASC, r.valor ASC")
  List<MgRetencionItbisResumenDTO> findAllResumen();

  /** Filtrado por tipo: "ITBIS" o "ISR". */
  @Query(
      "SELECT new com.braintech.eFacturador.dto.facturacion.MgRetencionItbisResumenDTO("
          + "  r.id, r.descripcion, r.valor, r.alTotal, r.tipoRetencion, r.comentarioFactura) "
          + "FROM MgRetencionItbis r "
          + "WHERE r.tipoRetencion = :tipoRetencion "
          + "ORDER BY r.valor ASC")
  List<MgRetencionItbisResumenDTO> findByTipoRetencion(
      @Param("tipoRetencion") String tipoRetencion);
}
