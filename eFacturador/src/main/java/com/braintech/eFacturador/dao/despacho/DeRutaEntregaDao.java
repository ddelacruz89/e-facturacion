package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaSearchCriteria;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface DeRutaEntregaDao {

  DeRutaEntrega save(DeRutaEntrega ruta);

  Optional<DeRutaEntrega> findById(Integer id, Integer empresaId);

  void disableById(Integer id, Integer empresaId);

  Page<DeRutaEntregaResumenDTO> searchByCriteria(
      DeRutaEntregaSearchCriteria criteria, Integer empresaId, Integer sucursalId);

  List<DeRutaEntrega> findByFechaAndConductor(
      LocalDate fecha, String conductorUsername, Integer empresaId);
}
