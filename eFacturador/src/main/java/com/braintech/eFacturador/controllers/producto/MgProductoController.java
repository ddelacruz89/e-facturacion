package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.dto.producto.MgProductoCompraDTO;
import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.dto.producto.MgProductoSearchCriteria;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.producto.MgProductoService;
import com.braintech.eFacturador.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/producto")
@RequiredArgsConstructor
public class MgProductoController {

  private final MgProductoService productoService;

  // Get all products
  @JsonView(Views.ConInventarios.class)
  @GetMapping
  public List<MgProducto> getAll() {
    return productoService.getAll();
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/{id}")
  public ResponseEntity<MgProducto> getById(@PathVariable Integer id) {
    MgProducto producto = productoService.getById(id);
    return ResponseEntity.ok(producto);
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/codigo-barra/{codigoBarra}")
  public ResponseEntity<MgProducto> getByCodigoBarra(@PathVariable String codigoBarra) {
    MgProducto producto = productoService.getByCodigoBarra(codigoBarra);
    return ResponseEntity.ok(producto);
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/search")
  public List<MgProducto> searchByNombre(@RequestParam String nombre) {
    return productoService.searchByNombre(nombre);
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/categoria/{categoriaId}")
  public List<MgProducto> getByCategoria(@PathVariable Integer categoriaId) {
    return productoService.getByCategoria(categoriaId);
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/disponibles-venta")
  public List<MgProducto> getAllAvailableForSale() {
    return productoService.getAllAvailableForSale();
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/trabajadores")
  public List<MgProducto> getAllWorkerProducts() {
    return productoService.getAllWorkerProducts();
  }

  @RequierePermiso(menuUrl = "/producto", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MgProducto> create(@RequestBody MgProducto producto) {
    MgProducto saved = productoService.create(producto);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    productoService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @JsonView(Views.ConInventarios.class)
  @GetMapping("/search/advanced/full")
  public List<MgProducto> searchAdvancedResumen(MgProductoSearchCriteria criteria) {
    return productoService.searchAdvancedResumen(criteria);
  }

  @GetMapping("/search/advanced")
  public Page<MgProductoResumenDTO> searchAdvanced(MgProductoSearchCriteria criteria) {
    return productoService.searchAdvanced(criteria);
  }

  /**
   * Búsqueda de productos filtrada a los que tienen al menos una unidad disponible en compra. Usada
   * por Orden de Compra y Cotización.
   */
  @GetMapping("/search/advanced/compra")
  public Page<MgProductoResumenDTO> searchAdvancedCompra(MgProductoSearchCriteria criteria) {
    return productoService.searchAdvancedCompra(criteria);
  }

  // ORDEN DE COMPRA

  /**
   * GET /search/almacen?almacenId=X&nombre=Y Productos activos con inventario en el almacén dado.
   * nombre es opcional.
   */
  @GetMapping("/search/almacen")
  public List<MgProductoResumenDTO> searchByAlmacen(
      @RequestParam Integer almacenId, @RequestParam(required = false) String nombre) {
    return productoService.searchByAlmacen(almacenId, nombre);
  }

  @GetMapping("/disponibles-compra/suplidor/{suplidorId}")
  public ResponseEntity<List<MgProductoResumenDTO>> getProductosDisponiblesCompraResumen(
      @PathVariable Integer suplidorId) {
    return ResponseEntity.ok(productoService.getProductosDisponiblesCompraResumen(suplidorId));
  }

  @GetMapping("/disponibles-compra/{productoId}/suplidorId/{suplidorId}")
  public ResponseEntity<MgProductoCompraDTO> getProductoCompraDetalle(
      @PathVariable Integer productoId, @PathVariable Integer suplidorId) {
    return ResponseEntity.ok(productoService.getProductoCompraDetalle(productoId, suplidorId));
  }
}
