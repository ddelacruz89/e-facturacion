package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.TipoItbisDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.jpa.facturacion.MfSucursalItbis;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TipoItbisServices implements ITipoEntity<MfSucursalItbis> {
  final TipoItbisDao tipoItbisDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  public Response<List<MfSucursalItbis>> findAll() {
    List<MfSucursalItbis> itbis = tipoItbisDao.findAll();
    if (itbis.isEmpty()) {
      return Response.<List<MfSucursalItbis>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFoundDTO("Tipo Itbis no tiene registro"))
          .build();
    }
    return Response.<List<MfSucursalItbis>>builder().status(HttpStatus.OK).content(itbis).build();
  }

  @Override
  public Response<MfSucursalItbis> save(MfSucursalItbis entity) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg("Master");
    MfSucursalItbis save = tipoItbisDao.save(entity);

    if (save.getId() > 0 && entity.getSecuencia() == null) {
      String sequenceName = entity.getClass().getSimpleName();
      Integer sequence = secuenciasDao.getNextSecuencia(empresaId, sequenceName);
      entity.setSecuencia(sequence);
      tipoItbisDao.save(entity);
    }
    return Response.<MfSucursalItbis>builder().status(HttpStatus.OK).content(save).build();
  }
}
