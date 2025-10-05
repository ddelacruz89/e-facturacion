package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.TipoFacturaDao;
import com.braintech.eFacturador.exceptions.DataNotFondException;
import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TipoFacturaService implements ITipoEntity<MgTipoFactura> {
  private final TipoFacturaDao tipoFacturaDao;

  @Override
  public Response<List<MgTipoFactura>> findAll() {
    List<MgTipoFactura> tipos = tipoFacturaDao.findAll();
    if (tipos.isEmpty()) {
      return Response.<List<MgTipoFactura>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFondException("Tipo Factura no tiene registro"))
          .build();
    }
    return Response.<List<MgTipoFactura>>builder().status(HttpStatus.OK).content(tipos).build();
  }

  @Override
  public Response<MgTipoFactura> save(MgTipoFactura entity) {
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg("Master");
    MgTipoFactura save = tipoFacturaDao.save(entity);

    if (save.getId() != 0) {
      return Response.<MgTipoFactura>builder().status(HttpStatus.OK).content(save).build();
    } else {

    }
    return null;
  }
}
