package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgRolResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgRolSearchCriteria;
import com.braintech.eFacturador.jpa.seguridad.SgRol;
import com.braintech.eFacturador.jpa.seguridad.SgUsuarioRol;
import com.braintech.eFacturador.services.seguridad.SgRolService;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seguridad/rol")
@AllArgsConstructor
public class SgRolController {

  private final SgRolService rolService;

  /** Búsqueda con resumen — usado por el modal de búsqueda del frontend. */
  @PostMapping("/buscar")
  public ResponseEntity<List<SgRolResumenDTO>> buscar(@RequestBody SgRolSearchCriteria criteria) {
    return ResponseEntity.ok(rolService.buscar(criteria));
  }

  /** Carga completa (con permisos) para edición. */
  @GetMapping("/{id}")
  public ResponseEntity<SgRol> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(rolService.getById(id));
  }

  /** Crear rol. */
  @PostMapping
  public ResponseEntity<SgRol> save(@RequestBody SgRol rol) {
    return ResponseEntity.ok(rolService.save(rol));
  }

  /** Actualizar rol. */
  @PutMapping("/{id}")
  public ResponseEntity<SgRol> update(@PathVariable Integer id, @RequestBody SgRol rol) {
    rol.setId(id);
    return ResponseEntity.ok(rolService.save(rol));
  }

  /** Listar usuarios asignados a este rol en la sucursal actual. */
  @GetMapping("/{id}/usuarios")
  public ResponseEntity<List<SgUsuarioRol>> getUsuarios(@PathVariable Integer id) {
    return ResponseEntity.ok(rolService.getUsuariosRol(id));
  }

  /** Asignar un usuario al rol en la sucursal actual. Body: { "username": "..." } */
  @PostMapping("/{id}/usuarios")
  public ResponseEntity<SgUsuarioRol> addUsuario(
      @PathVariable Integer id, @RequestBody Map<String, String> body) {
    return ResponseEntity.ok(rolService.addUsuarioRol(id, body.get("username")));
  }

  /** Remover una asignación usuario-rol. */
  @DeleteMapping("/{id}/usuarios/{asignacionId}")
  public ResponseEntity<Void> removeUsuario(
      @PathVariable Integer id, @PathVariable Integer asignacionId) {
    rolService.removeUsuarioRol(asignacionId);
    return ResponseEntity.noContent().build();
  }
}
