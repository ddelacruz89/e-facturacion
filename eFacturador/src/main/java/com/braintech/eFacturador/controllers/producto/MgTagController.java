package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.jpa.producto.MgTag;
import com.braintech.eFacturador.services.producto.MgTagService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/producto/tag")
@RequiredArgsConstructor
public class MgTagController {

  private final MgTagService tagService;

  // Get all active tags (activo = true)
  @GetMapping
  public List<MgTag> getAllActive() {
    return tagService.getAllActive();
  }

  // Get all tags including inactive
  @GetMapping("/all")
  public List<MgTag> getAll() {
    return tagService.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<MgTag> getById(@PathVariable Integer id) {
    MgTag tag = tagService.getById(id);
    return ResponseEntity.ok(tag);
  }

  @GetMapping("/nombre/{nombre}")
  public ResponseEntity<MgTag> getByNombre(@PathVariable String nombre) {
    MgTag tag = tagService.getByNombre(nombre);
    return ResponseEntity.ok(tag);
  }

  @PostMapping
  public ResponseEntity<MgTag> create(@RequestBody MgTag tag) {
    MgTag saved = tagService.create(tag);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<MgTag> update(@PathVariable Integer id, @RequestBody MgTag tag) {
    MgTag updated = tagService.update(id, tag);
    return ResponseEntity.ok(updated);
  }

  // Soft delete - changes activo to false
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    tagService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // === Product-Tag Association Endpoints ===

  // Add a tag to a product
  @PostMapping("/producto/{productoId}/tag/{tagId}")
  public ResponseEntity<Void> addTagToProduct(
      @PathVariable Integer productoId, @PathVariable Integer tagId) {
    tagService.addTagToProduct(productoId, tagId);
    return ResponseEntity.ok().build();
  }

  // Remove a tag from a product
  @DeleteMapping("/producto/{productoId}/tag/{tagId}")
  public ResponseEntity<Void> removeTagFromProduct(
      @PathVariable Integer productoId, @PathVariable Integer tagId) {
    tagService.removeTagFromProduct(productoId, tagId);
    return ResponseEntity.noContent().build();
  }

  // Get all tags for a specific product
  @GetMapping("/producto/{productoId}")
  public List<MgTag> getTagsByProducto(@PathVariable Integer productoId) {
    return tagService.getTagsByProducto(productoId);
  }
}
