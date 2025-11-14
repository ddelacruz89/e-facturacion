package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.models.Response;
import java.util.List;

public interface InSuplidorService {
  Response<?> create(InSuplidor suplidor);

  Response<?> update(Integer id, InSuplidor suplidor);

  Response<?> disable(Integer id);

  Response<?> getById(Integer id);

  Response<?> getAll();

  Response<?> getAllActive();

  Response<?> getByRnc(String rnc);

  InSuplidor findById(Integer id);

  List<InSuplidor> findAllByEmpresa();
}
