package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.models.IProductoVenta;
import java.util.List;

public interface IFacturacion {
  List<MfFactura> getAllActive();

  List<MfFactura> getAll();

  MfFactura getById(Integer id);

  MfFactura getByNumeroFactura(Integer numeroFactura);

  MfFactura create(MfFactura entity);

  MfFactura update(Integer id, MfFactura entity);

  void disable(Integer id);

  List<IProductoVenta> getProductoVenta();
}
