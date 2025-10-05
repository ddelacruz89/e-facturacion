package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.TipoItbisDao;
import com.braintech.eFacturador.exceptions.DataNotFondException;
import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TipoItbisServices implements ITipoEntity<MgItbis> {
  final TipoItbisDao tipoItbisDao;

  @Override
  public Response<List<MgItbis>> findAll() {
    List<MgItbis> itbis = tipoItbisDao.findAll();
    if (itbis.isEmpty()) {
      return Response.<List<MgItbis>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFondException("Tipo Itbis no tiene registro"))
          .build();
    }
    return Response.<List<MgItbis>>builder().status(HttpStatus.OK).content(itbis).build();
  }

  @Override
  public Response<MgItbis> save(MgItbis entity) {
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg("Master");
    MgItbis save = tipoItbisDao.save(entity);
    if (save.getId() != 0) {
      return Response.<MgItbis>builder().status(HttpStatus.OK).content(save).build();
    } else {

    }
    return null;
  }
}
