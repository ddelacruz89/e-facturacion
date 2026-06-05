package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.IFacturaResumen;
import com.braintech.eFacturador.jpa.facturacion.MfCotizacion;
import com.braintech.eFacturador.models.PagesResult;
import java.util.List;

public interface IContizacion {

  List<MfCotizacion> getAllActive();

  PagesResult<List<IFacturaResumen>> getAll(int page, int size);

  MfCotizacion getById(Integer id);

  MfCotizacion save(MfCotizacion cotizacion);

  MfCotizacion getByNumeroCotizacion(Integer numeroFactura);
}
