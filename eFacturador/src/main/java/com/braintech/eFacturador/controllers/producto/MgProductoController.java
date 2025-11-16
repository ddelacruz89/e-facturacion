package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.dto.producto.MgProductoSearchCriteria;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.services.producto.MgProductoService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/producto")
@RequiredArgsConstructor
public class MgProductoController {

  private final MgProductoService productoService;

  // Get all products
  @GetMapping
  public List<MgProducto> getAll() {
    return productoService.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<MgProducto> getById(@PathVariable Integer id) {
    MgProducto producto = productoService.getById(id);
    return ResponseEntity.ok(producto);
  }

  @GetMapping("/codigo-barra/{codigoBarra}")
  public ResponseEntity<MgProducto> getByCodigoBarra(@PathVariable String codigoBarra) {
    MgProducto producto = productoService.getByCodigoBarra(codigoBarra);
    return ResponseEntity.ok(producto);
  }

  @GetMapping("/search")
  public List<MgProducto> searchByNombre(@RequestParam String nombre) {
    return productoService.searchByNombre(nombre);
  }

  @GetMapping("/categoria/{categoriaId}")
  public List<MgProducto> getByCategoria(@PathVariable Integer categoriaId) {
    return productoService.getByCategoria(categoriaId);
  }

  @GetMapping("/disponibles-venta")
  public List<MgProducto> getAllAvailableForSale() {
    return productoService.getAllAvailableForSale();
  }

  @GetMapping("/trabajadores")
  public List<MgProducto> getAllWorkerProducts() {
    return productoService.getAllWorkerProducts();
  }

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

  @GetMapping("/search/advanced")
  public List<MgProducto> searchAdvancedResumen(MgProductoSearchCriteria criteria) {
    return productoService.searchAdvancedResumen(criteria);
  }

  @GetMapping("/search/advanced/full")
  public List<MgProductoResumenDTO> searchAdvanced(MgProductoSearchCriteria criteria) {
    return productoService.searchAdvanced(criteria);
  }
}
