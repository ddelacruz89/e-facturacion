package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO;
import com.braintech.eFacturador.dto.general.MgMunicipioSearchCriteria;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface MgMunicipioDao {
  Optional<MgMunicipio> findById(Integer id);

  List<MgMunicipioResumenDTO> findByProvincia(String codProvincia);

  Page<MgMunicipioResumenDTO> searchByCriteria(MgMunicipioSearchCriteria criteria);
}
