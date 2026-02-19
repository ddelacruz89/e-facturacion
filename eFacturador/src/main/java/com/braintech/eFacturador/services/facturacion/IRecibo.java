package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfRecibos;
import java.util.List;

public interface IRecibo {
  List<MfRecibos> getAllActive();

  List<MfRecibos> getAll();

  MfRecibos getById(Integer id);

  MfRecibos create(MfRecibos entity);

  MfRecibos update(Integer id, MfRecibos entity);

  void disable(Integer id);
}
