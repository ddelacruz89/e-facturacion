package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.dto.producto.MgPaqueteResumenDTO;
import com.braintech.eFacturador.dto.producto.MgPaqueteSearchCriteria;
import com.braintech.eFacturador.jpa.producto.MgPaquete;
import java.util.List;

public interface MgPaqueteService {
  List<MgPaqueteResumenDTO> buscar(MgPaqueteSearchCriteria criteria);

  MgPaquete getById(Integer id);

  MgPaquete save(MgPaquete paquete);
}
