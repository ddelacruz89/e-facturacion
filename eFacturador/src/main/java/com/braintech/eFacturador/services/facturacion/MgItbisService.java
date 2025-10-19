package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import java.util.List;

public interface MgItbisService {
  List<MgItbis> getAll();

  List<MgItbis> getAllActive();

  MgItbis getById(Integer id);

  MgItbis create(MgItbis entity);

  MgItbis update(Integer id, MgItbis entity);

  void delete(Integer id);
}
