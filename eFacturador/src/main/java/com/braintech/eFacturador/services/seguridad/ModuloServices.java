package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.ModuloDao;
import com.braintech.eFacturador.exceptions.DataNotFondException;
import com.braintech.eFacturador.interfaces.IBaseString;
import com.braintech.eFacturador.jpa.seguridad.SgModulo;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModuloServices implements IBaseString<SgModulo> {
  final ModuloDao moduloDao;

  @Override
  public Response<SgModulo> getFindById(String id) {
    Optional<SgModulo> entity = moduloDao.findById(id);
    if (entity.isPresent()) {
      return Response.<SgModulo>builder().content(entity.get()).status(HttpStatus.OK).build();
    } else {
      return Response.<SgModulo>builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFondException("Modulo no encontrado"))
          .build();
    }
  }

  @Override
  public Response<List<SgModulo>> getFindByAll() {
    List<SgModulo> entities = moduloDao.findAll();
    if (!entities.isEmpty()) {
      return Response.<List<SgModulo>>builder().content(entities).status(HttpStatus.OK).build();
    } else {
      return Response.<List<SgModulo>>builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFondException("Modulos no encontrado"))
          .build();
    }
  }

  @Override
  public Response<SgModulo> save(SgModulo entity) {
    return null;
  }
}
