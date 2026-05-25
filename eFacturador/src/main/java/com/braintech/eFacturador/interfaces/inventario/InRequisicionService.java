package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InRequisicionResumenDTO;
import com.braintech.eFacturador.dto.inventario.InRequisicionSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InRequisicionService {

  InRequisicion save(InRequisicion requisicion);

  InRequisicion findById(Integer id);

  List<InRequisicion> findAll();

  void disableById(Integer id);

  Page<InRequisicionResumenDTO> searchByCriteria(InRequisicionSearchCriteria criteria);
}
