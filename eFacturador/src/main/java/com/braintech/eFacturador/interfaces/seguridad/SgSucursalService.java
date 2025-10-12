package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import java.util.List;

public interface SgSucursalService {
  Response<?> save(SgSucursal sucursal);

  Response<?> update(Integer id, SgSucursal sucursal);

  Response<?> disable(Integer id);

  Response<?> getFindById(Integer id);

  Response<?> getFindByAll();

  // Keep original methods for backward compatibility
  SgSucursal findById(Integer id);

  List<SgSucursal> findAll();
}
