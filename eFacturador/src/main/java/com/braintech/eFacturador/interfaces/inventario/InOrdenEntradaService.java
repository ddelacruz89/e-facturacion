package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InOrdenEntradaService {
  InOrdenEntrada save(InOrdenEntrada ordenEntrada);

  InOrdenEntrada findById(Integer id);

  List<InOrdenEntrada> findAll();

  void disableById(Integer id);

  Page<InOrdenEntradaResumenDTO> searchByCriteria(InOrdenEntradaSearchCriteria criteria);
}
