package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InRequisicionResumenDTO;
import com.braintech.eFacturador.dto.inventario.InRequisicionSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InRequisicionService;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/requisiciones")
public class InRequisicionController {

  @Autowired private InRequisicionService inRequisicionService;

  @GetMapping
  public List<InRequisicion> getAll() {
    return inRequisicionService.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<InRequisicion> getById(@PathVariable Integer id) {
    InRequisicion requisicion = inRequisicionService.findById(id);
    if (requisicion == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(requisicion);
  }

  @RequierePermiso(menuUrl = "/inventario/requisicion", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<InRequisicion> create(@RequestBody InRequisicion requisicion) {
    InRequisicion saved = inRequisicionService.save(requisicion);
    return ResponseEntity.ok(saved);
  }

  @RequierePermiso(menuUrl = "/inventario/requisicion", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<InRequisicion> update(
      @PathVariable Integer id, @RequestBody InRequisicion requisicion) {
    InRequisicion existing = inRequisicionService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    requisicion.setId(id);
    InRequisicion updated = inRequisicionService.save(requisicion);
    return ResponseEntity.ok(updated);
  }

  @PostMapping("/buscar")
  public ResponseEntity<Page<InRequisicionResumenDTO>> buscar(
      @RequestBody InRequisicionSearchCriteria criteria) {
    return ResponseEntity.ok(inRequisicionService.searchByCriteria(criteria));
  }

  @RequierePermiso(menuUrl = "/inventario/requisicion", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    InRequisicion existing = inRequisicionService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    inRequisicionService.disableById(id);
    return ResponseEntity.noContent().build();
  }
}
