package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InAlmacenRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InAlmacenService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/almacenes")
public class InAlmacenController {
  @Autowired private InAlmacenService inAlmacenService;

  /** GET / — Solo activos del tenant actual. */
  @GetMapping
  public List<InAlmacen> getAll() {
    return inAlmacenService.getAllActive();
  }

  /** GET /all — Activos e inactivos del tenant actual. */
  @GetMapping("/all")
  public List<InAlmacen> getAllIncludingInactive() {
    return inAlmacenService.getAll();
  }

  /** GET /{id} */
  @GetMapping("/{id}")
  public ResponseEntity<InAlmacen> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(inAlmacenService.getById(id));
  }

  /** POST / — Crear almacén. La sucursalId viene en el body; empresa del TenantContext. */
  @RequierePermiso(menuUrl = "/inventario/almacenes", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<InAlmacen> create(@RequestBody InAlmacenRequestDTO request) {
    return ResponseEntity.ok(inAlmacenService.create(request));
  }

  /** PUT /{id} — Actualizar almacén. La sucursalId puede cambiar según el body. */
  @RequierePermiso(menuUrl = "/inventario/almacenes", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<InAlmacen> update(
      @PathVariable Integer id, @RequestBody InAlmacenRequestDTO request) {
    return ResponseEntity.ok(inAlmacenService.update(id, request));
  }

  /** DELETE /{id} — Desactivar (soft delete → estadoId = 'INA'). */
  @RequierePermiso(menuUrl = "/inventario/almacenes", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    inAlmacenService.disable(id);
    return ResponseEntity.noContent().build();
  }

  /** PATCH /{id}/activar — Reactivar almacén (estadoId = 'ACT'). */
  @RequierePermiso(menuUrl = "/inventario/almacenes", accion = Accion.ESCRIBIR)
  @PatchMapping("/{id}/activar")
  public ResponseEntity<Void> enable(@PathVariable Integer id) {
    inAlmacenService.enable(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * POST /buscar — Búsqueda cross-sucursal dentro de la empresa. Filtros opcionales: sucursalId,
   * nombre, estadoId.
   */
  @PostMapping("/buscar")
  public ResponseEntity<List<InAlmacenResumenDTO>> buscar(
      @RequestBody InAlmacenSearchCriteria criteria) {
    return ResponseEntity.ok(inAlmacenService.buscar(criteria));
  }
}
