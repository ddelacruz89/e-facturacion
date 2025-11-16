package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.dto.producto.MgProductoSearchCriteria;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import java.util.List;

public interface MgProductoService {
  List<MgProducto> getAll();

  MgProducto getById(Integer id);

  MgProducto getByCodigoBarra(String codigoBarra);

  List<MgProducto> searchByNombre(String nombre);

  List<MgProducto> getByCategoria(Integer categoriaId);

  List<MgProducto> getAllAvailableForSale();

  List<MgProducto> getAllWorkerProducts();

  MgProducto create(MgProducto producto);

  void delete(Integer id);

  // Advanced search
  List<MgProducto> searchAdvancedResumen(MgProductoSearchCriteria criteria);

  List<MgProductoResumenDTO> searchAdvanced(MgProductoSearchCriteria criteria);
}
