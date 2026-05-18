package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InOrdenEntradaService;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/orden-entrada")
public class InOrdenEntradaController {
  @Autowired private InOrdenEntradaService inOrdenEntradaService;

  @GetMapping
  public List<InOrdenEntrada> getAll() {
    return inOrdenEntradaService.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<InOrdenEntrada> getById(@PathVariable Integer id) {
    InOrdenEntrada ordenEntrada = inOrdenEntradaService.findById(id);
    if (ordenEntrada == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(ordenEntrada);
  }

  @RequierePermiso(menuUrl = "/inventario/orden-entrada", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<InOrdenEntrada> create(@RequestBody InOrdenEntrada ordenEntrada) {
    InOrdenEntrada saved = inOrdenEntradaService.save(ordenEntrada);
    return ResponseEntity.ok(saved);
  }

  @RequierePermiso(menuUrl = "/inventario/orden-entrada", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<InOrdenEntrada> update(
      @PathVariable Integer id, @RequestBody InOrdenEntrada ordenEntrada) {
    InOrdenEntrada existing = inOrdenEntradaService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    ordenEntrada.setId(id);
    InOrdenEntrada updated = inOrdenEntradaService.save(ordenEntrada);
    return ResponseEntity.ok(updated);
  }

  @PostMapping("/buscar")
  public ResponseEntity<Page<InOrdenEntradaResumenDTO>> buscar(
      @RequestBody InOrdenEntradaSearchCriteria criteria) {
    return ResponseEntity.ok(inOrdenEntradaService.searchByCriteria(criteria));
  }

  @RequierePermiso(menuUrl = "/inventario/orden-entrada", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    InOrdenEntrada existing = inOrdenEntradaService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    inOrdenEntradaService.disableById(id);
    return ResponseEntity.noContent().build();
  }
}
