package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.dto.general.MgSubBarrioResumenDTO;
import java.util.List;

public interface MgSubBarrioDao {
  List<MgSubBarrioResumenDTO> findByBarrio(Integer barrioId);
}
