package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.jpa.inventario.InLote;
import java.util.List;

public interface InLoteService {
  InLote save(InLote lote);

  InLote findById(String lote, Long productoId);

  List<InLote> findAll();

  void disableById(String lote, Long productoId);
}
