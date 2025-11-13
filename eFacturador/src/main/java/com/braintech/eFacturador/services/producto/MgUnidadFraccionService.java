package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.jpa.producto.MgUnidadFraccion;
import java.util.List;

public interface MgUnidadFraccionService {
  List<MgUnidadFraccion> getAll();

  List<MgUnidadFraccion> getAllActive();

  MgUnidadFraccion getById(Integer id);

  MgUnidadFraccion create(MgUnidadFraccion unidadFraccion);

  MgUnidadFraccion update(Integer id, MgUnidadFraccion unidadFraccion);

  void delete(Integer id);
}
