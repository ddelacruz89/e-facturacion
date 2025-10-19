package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.jpa.producto.MgUnidad;
import java.util.List;

public interface MgUnidadService {
  List<MgUnidad> getAll();

  List<MgUnidad> getAllActive();

  MgUnidad getById(Integer id);

  MgUnidad create(MgUnidad unidad);

  MgUnidad update(Integer id, MgUnidad unidad);

  void delete(Integer id);
}
