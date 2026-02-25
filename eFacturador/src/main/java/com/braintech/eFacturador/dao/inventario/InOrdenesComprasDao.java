package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenesComprasResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSearchCriteria;
import org.springframework.data.domain.Page;

public interface InOrdenesComprasDao {
  Page<InOrdenesComprasResumenDTO> searchByCriteria(
      InOrdenesComprasSearchCriteria criteria, Integer empresaId);
}
