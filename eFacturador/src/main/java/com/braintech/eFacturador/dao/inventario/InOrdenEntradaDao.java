package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import java.util.List;
import java.util.Optional;

public interface InOrdenEntradaDao {
  // InOrdenEntrada extends BaseSucursal - filter by empresaId AND sucursalId

  InOrdenEntrada save(InOrdenEntrada ordenEntrada);

  Optional<InOrdenEntrada> findById(Integer id, Integer empresaId);

  Optional<InOrdenEntrada> findById(Integer id, Integer empresaId, Integer sucursalId);

  List<InOrdenEntrada> findAll(Integer empresaId);

  List<InOrdenEntrada> findAll(Integer empresaId, Integer sucursalId);

  void disableById(Integer id, Integer empresaId);

  void disableById(Integer id, Integer empresaId, Integer sucursalId);
}
