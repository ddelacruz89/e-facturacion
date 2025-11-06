package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.jpa.producto.MgCategoria;
import java.util.List;

public interface MgCategoriaService {
  List<MgCategoria> getAll();

  List<MgCategoria> getAllActive();

  MgCategoria getById(String id);

  MgCategoria create(MgCategoria mgCategoria);

  MgCategoria update(Integer id, MgCategoria mgCategoria);

  void delete(Integer id);
}
