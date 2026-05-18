package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InProductoLotesStockDTO;
import com.braintech.eFacturador.dto.inventario.InTransferenciaRequestDTO;
import com.braintech.eFacturador.models.Response;

public interface InTransferenciaService {

  Response<?> create(InTransferenciaRequestDTO requestDTO);

  Response<?> update(Integer id, InTransferenciaRequestDTO requestDTO);

  Response<?> getById(Integer id);

  Response<?> getAll();

  Response<?> getAllActive();

  Response<?> disable(Integer id);

  Response<?> getStockProductoEnAlmacen(Integer productoId, Integer almacenId);

  /**
   * Stock de un producto en un almacén desglosado por lote. Devuelve total disponible + lista de
   * lotes con su cantidad individual.
   */
  InProductoLotesStockDTO getLotesConStockEnAlmacen(Integer productoId, Integer almacenId);
}
