package com.braintech.eFacturador.interfaces.general;

import com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO;
import com.braintech.eFacturador.dto.general.MgSubBarrioResumenDTO;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import com.braintech.eFacturador.models.Response;
import java.util.List;

public interface BarrioParajeService {
  Response<MgBarrioParaje> getById(Integer id);

  Response<List<MgBarrioParajeResumenDTO>> getByMunicipio(Integer municipioId);

  Response<List<MgSubBarrioResumenDTO>> getSubBarriosByBarrio(Integer barrioId);
}
