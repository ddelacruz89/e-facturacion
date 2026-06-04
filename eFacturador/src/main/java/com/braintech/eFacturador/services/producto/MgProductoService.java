package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.dto.producto.MgProductoCompraDTO;
import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.dto.producto.MgProductoSearchCriteria;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.ProductoResumen;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

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

  Page<MgProductoResumenDTO> searchAdvanced(MgProductoSearchCriteria criteria);

  Page<MgProductoResumenDTO> searchAdvancedCompra(MgProductoSearchCriteria criteria);

  List<MgProductoResumenDTO> getProductosDisponiblesCompraResumen(Integer suplidorId);

  MgProductoCompraDTO getProductoCompraDetalle(Integer productoId, Integer suplidorId);

  /** Productos activos con inventario en el almacén dado, filtrados opcionalmente por nombre. */
  List<MgProductoResumenDTO> searchByAlmacen(Integer almacenId, String nombre);

  Optional<ProductoResumen> getProductoResumenById(Integer id);
}
