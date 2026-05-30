package com.braintech.eFacturador.controllers.despacho;

import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoSearchCriteria;
import com.braintech.eFacturador.dto.despacho.MarcarEstadoDTO;
import com.braintech.eFacturador.dto.despacho.MisEntregasRutaDTO;
import com.braintech.eFacturador.interfaces.despacho.DeOrdenDespachoService;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/despacho/ordenes")
@AllArgsConstructor
public class DeOrdenDespachoController {

  private final DeOrdenDespachoService ordenDespachoService;

  @GetMapping("/pendientes")
  public List<DeOrdenDespacho> getPendientes() {
    return ordenDespachoService.findPendientes();
  }

  @GetMapping("/{id}")
  public ResponseEntity<DeOrdenDespacho> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(ordenDespachoService.findById(id));
  }

  @RequierePermiso(menuUrl = "/despacho/ordenes", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<DeOrdenDespacho> create(@RequestBody DeOrdenDespacho orden) {
    return ResponseEntity.ok(ordenDespachoService.save(orden));
  }

  @RequierePermiso(menuUrl = "/despacho/ordenes", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<DeOrdenDespacho> update(
      @PathVariable Integer id, @RequestBody DeOrdenDespacho orden) {
    orden.setId(id);
    return ResponseEntity.ok(ordenDespachoService.save(orden));
  }

  @PostMapping("/buscar")
  public ResponseEntity<Page<DeOrdenDespachoResumenDTO>> buscar(
      @RequestBody DeOrdenDespachoSearchCriteria criteria) {
    return ResponseEntity.ok(ordenDespachoService.searchByCriteria(criteria));
  }

  @PatchMapping("/{id}/estado")
  public ResponseEntity<DeOrdenDespacho> marcarEstado(
      @PathVariable Integer id, @RequestBody MarcarEstadoDTO dto) {
    return ResponseEntity.ok(
        ordenDespachoService.marcarEstado(id, dto.getEstadoId(), dto.getNotas()));
  }

  @GetMapping("/mis-entregas")
  public ResponseEntity<List<MisEntregasRutaDTO>> getMisEntregas(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate fecha) {
    if (fecha == null) fecha = LocalDate.now();
    return ResponseEntity.ok(ordenDespachoService.getMisEntregas(fecha));
  }

  @RequierePermiso(menuUrl = "/despacho/ordenes", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    ordenDespachoService.disableById(id);
    return ResponseEntity.noContent().build();
  }
}
