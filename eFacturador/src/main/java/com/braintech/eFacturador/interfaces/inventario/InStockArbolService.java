package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockCriticoDTO;
import com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InStockArbolService {

  /**
   * Nivel 1: retorna los productos con su cantidad total, paginado server-side. No incluye
   * almacenes ni lotes — se cargan bajo demanda al expandir.
   */
  Page<InStockProductoNodoDTO> buscarProductos(InStockArbolSearchCriteria criteria);

  /**
   * Nivel 2: retorna los almacenes (con cantidad total) de un producto concreto. Se llama al
   * expandir una fila de producto en el frontend.
   */
  List<InStockAlmacenNodoDTO> buscarAlmacenesPorProducto(
      Integer productoId, InStockArbolSearchCriteria criteria);

  /**
   * Nivel 3: retorna los lotes de un producto en un almacén concreto. Se llama al expandir una fila
   * de almacén en el frontend.
   */
  List<InStockLoteNodoDTO> buscarLotesPorProductoAlmacen(
      Integer productoId, Integer almacenId, InStockArbolSearchCriteria criteria);

  /** Lista plana de producto-almacén por debajo del límite mínimo. */
  List<InStockCriticoDTO> getStockCritico();
}
