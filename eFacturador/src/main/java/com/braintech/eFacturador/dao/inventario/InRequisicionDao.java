package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InRequisicionResumenDTO;
import com.braintech.eFacturador.dto.inventario.InRequisicionSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface InRequisicionDao {

  InRequisicion save(InRequisicion requisicion);

  Optional<InRequisicion> findById(Integer id, Integer empresaId);

  List<InRequisicion> findAll(Integer empresaId);

  void disableById(Integer id, Integer empresaId);

  Page<InRequisicionResumenDTO> searchByCriteria(
      InRequisicionSearchCriteria criteria, Integer empresaId);
}
