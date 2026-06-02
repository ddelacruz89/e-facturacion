package com.braintech.eFacturador.interfaces.general;

import com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO;
import com.braintech.eFacturador.dto.general.MgMunicipioSearchCriteria;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import org.springframework.data.domain.Page;

public interface MunicipioService {
  Response<MgMunicipio> getById(Integer id);

  Response<List<MgMunicipioResumenDTO>> getByProvincia(String codProvincia);

  Response<Page<MgMunicipioResumenDTO>> buscar(MgMunicipioSearchCriteria criteria);
}
