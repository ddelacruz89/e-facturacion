package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.CotizacionDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dto.facturacion.IFacturaResumen;
import com.braintech.eFacturador.jpa.facturacion.MfCotizacion;
import com.braintech.eFacturador.models.PagesResult;
import com.braintech.eFacturador.util.LocalDateZone;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CotizacionServices implements IContizacion {
  private final CotizacionDao cotizacionDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  public List<MfCotizacion> getAllActive() {
    return List.of();
  }

  @Override
  public PagesResult<List<IFacturaResumen>> getAll(int page, int size) {
    return null;
  }

  @Override
  public MfCotizacion getById(Integer id) {
    return null;
  }

  @Override
  public MfCotizacion save(MfCotizacion cotizacion) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    cotizacion.setEmpresaId(empresaId);
    cotizacion.setSucursalId(sucursalId);
    cotizacion.setUsuarioReg(username);
    cotizacion.setFechaReg(LocalDateZone.toLocalDateTime());
    int nextSecuencia =
        secuenciasDao.getNextSecuencia(
            empresaId, MfCotizacion.class.getSimpleName().toUpperCase(Locale.ROOT));
    cotizacion.setSecuencia(nextSecuencia);
    MfCotizacion save = cotizacionDao.save(cotizacion);
    return save;
  }

  @Override
  public MfCotizacion getByNumeroCotizacion(Integer numeroFactura) {
    return null;
  }
}
