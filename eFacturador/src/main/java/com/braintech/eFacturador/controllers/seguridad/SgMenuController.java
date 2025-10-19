package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgMenu;
import com.braintech.eFacturador.services.seguridad.SgMenuService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seguridad/menu")
@RequiredArgsConstructor
public class SgMenuController {

  private final SgMenuService menuService;

  // Get all active menus (activo = true), ordered by orden
  @GetMapping("/activos")
  public List<SgMenu> getAllActive() {
    return menuService.getAllActive();
  }

  // Get all menus including inactive
  @GetMapping("/all")
  public List<SgMenu> getAll() {
    return menuService.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<SgMenu> getById(@PathVariable Integer id) {
    SgMenu menu = menuService.getById(id);
    return ResponseEntity.ok(menu);
  }

  // Get menus by modulo ID (only active)
  @GetMapping("/modulo/{moduloId}")
  public List<SgMenu> getByModuloId(@PathVariable String moduloId) {
    return menuService.getByModuloId(moduloId);
  }

  // Get menus by tipo menu ID (only active)
  @GetMapping("/tipo-menu/{tipoMenuId}")
  public List<SgMenu> getByTipoMenuId(@PathVariable Integer tipoMenuId) {
    return menuService.getByTipoMenuId(tipoMenuId);
  }

  @PostMapping
  public ResponseEntity<SgMenu> create(@RequestBody SgMenu menu) {
    SgMenu saved = menuService.create(menu);
    return ResponseEntity.ok(saved);
  }

  // Soft delete - changes activo to false
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    menuService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
