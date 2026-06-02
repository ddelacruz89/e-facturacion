package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import java.util.List;
import java.util.Optional;

public interface MgBarrioParajeDao {
  Optional<MgBarrioParaje> findById(Integer id);

  List<MgBarrioParajeResumenDTO> findByMunicipio(Integer municipioId);
}
