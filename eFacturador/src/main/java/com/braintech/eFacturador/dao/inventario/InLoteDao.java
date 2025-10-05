package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InLote;
import java.util.List;
import java.util.Optional;

public interface InLoteDao {
  InLote save(InLote lote);

  Optional<InLote> findById(String lote, Long productoId);

  List<InLote> findAll();

  void disableById(String lote, Long productoId);
}
