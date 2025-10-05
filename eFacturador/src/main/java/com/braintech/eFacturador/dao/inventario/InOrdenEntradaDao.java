package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import java.util.List;
import java.util.Optional;

public interface InOrdenEntradaDao {
  InOrdenEntrada save(InOrdenEntrada ordenEntrada);

  Optional<InOrdenEntrada> findById(Integer id);

  List<InOrdenEntrada> findAll();

  void disableById(Integer id);
}
