package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InSuplidorProductoRequestDTO;
import com.braintech.eFacturador.dto.inventario.InSuplidorSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.models.Response;
import java.util.List;

public interface InSuplidorService {
  Response<?> create(InSuplidor suplidor);

  Response<?> update(Integer id, InSuplidor suplidor);

  Response<?> disable(Integer id);

  Response<?> getById(Integer id);

  Response<?> getAll();

  Response<?> getAllActive();

  Response<?> getByRnc(String rnc);

  InSuplidor findById(Integer id);

  List<InSuplidor> findAllByEmpresa();

  Response<?> getAllActiveSimple();

  // Búsqueda paginada
  Response<?> buscar(InSuplidorSearchCriteria criteria);

  // Gestión de productos del suplidor
  Response<?> getProductos(Integer suplidorId);

  Response<?> addProducto(Integer suplidorId, InSuplidorProductoRequestDTO request);

  Response<?> updateProductoPrecio(
      Integer suplidorId, Integer id, InSuplidorProductoRequestDTO request);

  Response<?> removeProducto(Integer suplidorId, Integer id);
}
