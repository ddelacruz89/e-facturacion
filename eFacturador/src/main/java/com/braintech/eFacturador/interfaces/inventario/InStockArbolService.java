package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import java.util.List;

public interface InStockArbolService {

  /**
   * Retorna el inventario agrupado en árbol: producto → almacén → lote. El tenant (empresaId /
   * sucursalId) se obtiene del {@code TenantContext}.
   */
  List<InStockProductoNodoDTO> buscarArbol(InStockArbolSearchCriteria criteria);
}
