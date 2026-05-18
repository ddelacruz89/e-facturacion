package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import java.util.List;

public interface InStockArbolDao {

  /**
   * Nivel 1: productos con su cantidad total (GROUP BY producto). No trae almacenes ni lotes.
   *
   * @param empresaId siempre requerido (tenant)
   * @param criteria filtros opcionales: sucursalId, almacenId, productoNombre, soloConStock
   */
  List<InStockProductoNodoDTO> findProductos(
      Integer empresaId, InStockArbolSearchCriteria criteria);

  /**
   * Nivel 2: almacenes con cantidad total para un producto concreto (GROUP BY almacén).
   *
   * @param empresaId tenant
   * @param productoId producto expandido
   * @param criteria filtros: sucursalId, soloConStock (almacenId se ignora en este nivel)
   */
  List<InStockAlmacenNodoDTO> findAlmacenesPorProducto(
      Integer empresaId, Integer productoId, InStockArbolSearchCriteria criteria);

  /**
   * Nivel 3: lotes de un producto en un almacén concreto.
   *
   * @param empresaId tenant
   * @param productoId producto expandido
   * @param almacenId almacén expandido
   * @param criteria filtros: sucursalId, soloConStock
   */
  List<InStockLoteNodoDTO> findLotesPorProductoAlmacen(
      Integer empresaId,
      Integer productoId,
      Integer almacenId,
      InStockArbolSearchCriteria criteria);
}
