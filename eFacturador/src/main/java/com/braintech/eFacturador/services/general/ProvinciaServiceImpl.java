package com.braintech.eFacturador.services.general;

import com.braintech.eFacturador.dao.general.MgProvinciaDao;
import com.braintech.eFacturador.interfaces.general.ProvinciaService;
import com.braintech.eFacturador.jpa.general.MgProvincia;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProvinciaServiceImpl implements ProvinciaService {

  private final MgProvinciaDao mgProvinciaDao;

  @Override
  public Response<List<MgProvincia>> getAll() {
    List<MgProvincia> provincias = mgProvinciaDao.findAll();
    return Response.<List<MgProvincia>>builder().status(HttpStatus.OK).content(provincias).build();
  }
}
