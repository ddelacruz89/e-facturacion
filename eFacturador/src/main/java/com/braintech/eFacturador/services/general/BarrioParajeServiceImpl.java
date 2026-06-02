package com.braintech.eFacturador.services.general;

import com.braintech.eFacturador.dao.general.MgBarrioParajeDao;
import com.braintech.eFacturador.dao.general.MgSubBarrioDao;
import com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO;
import com.braintech.eFacturador.dto.general.MgSubBarrioResumenDTO;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.general.BarrioParajeService;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BarrioParajeServiceImpl implements BarrioParajeService {

  private final MgBarrioParajeDao barrioDao;
  private final MgSubBarrioDao subBarrioDao;

  @Override
  public Response<MgBarrioParaje> getById(Integer id) {
    return barrioDao
        .findById(id)
        .map(b -> Response.<MgBarrioParaje>builder().status(HttpStatus.OK).content(b).build())
        .orElseGet(
            () ->
                Response.<MgBarrioParaje>builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Barrio/Paraje no encontrado: " + id))
                    .build());
  }

  @Override
  public Response<List<MgBarrioParajeResumenDTO>> getByMunicipio(Integer municipioId) {
    return Response.<List<MgBarrioParajeResumenDTO>>builder()
        .status(HttpStatus.OK)
        .content(barrioDao.findByMunicipio(municipioId))
        .build();
  }

  @Override
  public Response<List<MgSubBarrioResumenDTO>> getSubBarriosByBarrio(Integer barrioId) {
    return Response.<List<MgSubBarrioResumenDTO>>builder()
        .status(HttpStatus.OK)
        .content(subBarrioDao.findByBarrio(barrioId))
        .build();
  }
}
