package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.IFacturaResumen;
import com.braintech.eFacturador.dto.facturacion.MfFacturaParaDespachoDTO;
import com.braintech.eFacturador.dto.facturacion.PrecioVentaDto;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.models.PagesResult;
import java.util.List;

public interface IFacturacion {
  List<MfFactura> getAllActive();

  PagesResult<List<IFacturaResumen>> getAll(int page, int size);

  MfFactura getById(Integer id);

  MfFactura getByNumeroFactura(Integer numeroFactura);

  MfFactura create(MfFactura entity);

  MfFactura update(Integer id, MfFactura entity);

  void disable(Integer id);

  List<PrecioVentaDto> getProductoVenta();

  void updateEfcSenderId(
      Integer id, String fechaFirma, String secuityCode, String qrUrl, String trackId);

  List<MfFacturaParaDespachoDTO> getFacturasParaDespacho();

  List<MfFacturaParaDespachoDTO> getFacturasParaDespacho(Integer rutaId);
}
