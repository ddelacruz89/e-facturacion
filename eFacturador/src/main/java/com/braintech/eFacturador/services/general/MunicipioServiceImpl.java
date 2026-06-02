package com.braintech.eFacturador.services.general;

import com.braintech.eFacturador.dao.general.MgMunicipioDao;
import com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO;
import com.braintech.eFacturador.dto.general.MgMunicipioSearchCriteria;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.general.MunicipioService;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MunicipioServiceImpl implements MunicipioService {

  private final MgMunicipioDao mgMunicipioDao;

  @Override
  public Response<MgMunicipio> getById(Integer id) {
    return mgMunicipioDao
        .findById(id)
        .map(m -> Response.<MgMunicipio>builder().status(HttpStatus.OK).content(m).build())
        .orElseGet(
            () ->
                Response.<MgMunicipio>builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Municipio no encontrado: " + id))
                    .build());
  }

  @Override
  public Response<List<MgMunicipioResumenDTO>> getByProvincia(String codProvincia) {
    List<MgMunicipioResumenDTO> list = mgMunicipioDao.findByProvincia(codProvincia);
    return Response.<List<MgMunicipioResumenDTO>>builder()
        .status(HttpStatus.OK)
        .content(list)
        .build();
  }

  @Override
  public Response<Page<MgMunicipioResumenDTO>> buscar(MgMunicipioSearchCriteria criteria) {
    return Response.<Page<MgMunicipioResumenDTO>>builder()
        .status(HttpStatus.OK)
        .content(mgMunicipioDao.searchByCriteria(criteria))
        .build();
  }
}
