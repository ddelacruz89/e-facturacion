package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import java.util.List;

public interface InAlmacenService {
  InAlmacen create(InAlmacen almacen);

  InAlmacen update(Integer id, InAlmacen almacen);

  InAlmacen getById(Integer id);

  List<InAlmacen> getAll();

  List<InAlmacen> getAllActive();

  void disable(Integer id);
}
