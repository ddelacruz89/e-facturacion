package com.braintech.eFacturador.services.producto;

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
}
