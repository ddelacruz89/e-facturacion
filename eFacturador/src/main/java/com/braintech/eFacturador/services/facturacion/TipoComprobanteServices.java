package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.TipoComprobanteDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.jpa.facturacion.MgTipoComprobante;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TipoComprobanteServices implements ITipoEntity<MgTipoComprobante> {
  private final TipoComprobanteDao tipoComprobanteDao;

  @Override
  public Response<List<MgTipoComprobante>> findAll() {
    List<MgTipoComprobante> tipos = tipoComprobanteDao.findAll();
    if (tipos.isEmpty()) {
      return Response.<List<MgTipoComprobante>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFoundDTO("Tipo Factura no tiene registro"))
          .build();
    }
    return Response.<List<MgTipoComprobante>>builder().status(HttpStatus.OK).content(tipos).build();
  }

  @Override
  public Response<MgTipoComprobante> save(MgTipoComprobante entity) {
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg("Master");
    MgTipoComprobante save = tipoComprobanteDao.save(entity);

    if (!save.getId().isEmpty()) {
      return Response.<MgTipoComprobante>builder().status(HttpStatus.OK).content(save).build();
    } else {

    }
    return null;
  }
}
