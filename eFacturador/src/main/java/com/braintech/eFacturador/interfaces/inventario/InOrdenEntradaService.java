package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import java.util.List;

public interface InOrdenEntradaService {
  InOrdenEntrada save(InOrdenEntrada ordenEntrada);

  InOrdenEntrada findById(Integer id);

  List<InOrdenEntrada> findAll();

  void disableById(Integer id);
}
