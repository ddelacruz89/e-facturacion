package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import java.util.List;
import java.util.Optional;

public interface InAjusteInventarioDao {
  InAjusteInventario save(InAjusteInventario ajuste);

  Optional<InAjusteInventario> findById(Integer id, Integer empresaId, Integer sucursalId);

  List<InAjusteInventarioResumenDTO> findByAlmacen(
      Integer almacenId, Integer empresaId, Integer sucursalId);
}
