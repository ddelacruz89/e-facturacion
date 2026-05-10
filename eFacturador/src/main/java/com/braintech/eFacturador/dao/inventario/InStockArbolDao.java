package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InStockArbolFlatDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import java.util.List;

public interface InStockArbolDao {

  /**
   * Consulta plana dinámica para construir el árbol de stock. Solo agrega cláusulas WHERE para los
   * filtros que no sean null/vacíos, permitiendo que el query planner use índices correctamente.
   *
   * @param empresaId siempre requerido (tenant)
   * @param criteria filtros opcionales: sucursalId, almacenId, productoNombre, soloConStock
   */
  List<InStockArbolFlatDTO> findStockArbol(Integer empresaId, InStockArbolSearchCriteria criteria);
}
