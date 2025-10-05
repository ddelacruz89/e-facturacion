package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.exceptions.DataNotFondException;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class FacturacionServices implements IFacturacion {
  private final FacturaDao facturaDao;

  @Override
  public Response<MfFactura> getFindById(Integer id, Integer empresaId) {
    Optional<MfFactura> entity = facturaDao.getFacturaByNumeroFactura(id, empresaId);
    if (entity.isPresent()) {
      return Response.<MfFactura>builder().status(HttpStatus.OK).content(entity.get()).build();
    } else {
      return Response.<MfFactura>builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFondException("Factura no tiene registro"))
          .build();
    }
  }

  @Override
  public Response<List<MfFactura>> getFindByAll(Integer empresaId) {
    List<MfFactura> facturas = facturaDao.getFindByAll(empresaId);
    if (facturas.isEmpty()) {
      return Response.<List<MfFactura>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFondException("Tipo Factura no tiene registro"))
          .build();
    }
    return Response.<List<MfFactura>>builder().status(HttpStatus.OK).content(facturas).build();
  }

  @Override
  public Response<MfFactura> save(MfFactura entity) {
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg("Master");
    MfFactura save = facturaDao.save(entity);

    if (save.getId() != 0) {
      return Response.<MfFactura>builder().status(HttpStatus.OK).content(save).build();
    } else {
      return null;
    }
  }
}
