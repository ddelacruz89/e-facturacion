package com.braintech.eFacturador.controllers.despacho;

import com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaSearchCriteria;
import com.braintech.eFacturador.dto.despacho.DeRutaZonaResumenDTO;
import com.braintech.eFacturador.interfaces.despacho.DeRutaEntregaService;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import com.braintech.eFacturador.jpa.despacho.DeRutaZona;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/despacho/rutas")
@AllArgsConstructor
public class DeRutaEntregaController {

  private final DeRutaEntregaService rutaEntregaService;

  @GetMapping("/{id}")
  public ResponseEntity<DeRutaEntrega> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(rutaEntregaService.findById(id));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<DeRutaEntrega> create(@RequestBody DeRutaEntrega ruta) {
    return ResponseEntity.ok(rutaEntregaService.save(ruta));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<DeRutaEntrega> update(
      @PathVariable Integer id, @RequestBody DeRutaEntrega ruta) {
    ruta.setId(id);
    return ResponseEntity.ok(rutaEntregaService.save(ruta));
  }

  @PostMapping("/buscar")
  public ResponseEntity<Page<DeRutaEntregaResumenDTO>> buscar(
      @RequestBody DeRutaEntregaSearchCriteria criteria) {
    return ResponseEntity.ok(rutaEntregaService.searchByCriteria(criteria));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @PostMapping("/{id}/asignar-ordenes")
  public ResponseEntity<DeRutaEntrega> asignarOrdenes(
      @PathVariable Integer id, @RequestBody Map<String, List<Integer>> body) {
    List<Integer> ordenIds = body.get("ordenIds");
    return ResponseEntity.ok(rutaEntregaService.asignarOrdenes(id, ordenIds));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @PostMapping("/{id}/asignar-facturas")
  public ResponseEntity<DeRutaEntrega> asignarFacturas(
      @PathVariable Integer id, @RequestBody Map<String, List<Integer>> body) {
    List<Integer> facturaIds = body.get("facturaIds");
    return ResponseEntity.ok(rutaEntregaService.asignarFacturas(id, facturaIds));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @PatchMapping("/{id}/estado")
  public ResponseEntity<DeRutaEntrega> cambiarEstado(
      @PathVariable Integer id, @RequestBody Map<String, String> body) {
    return ResponseEntity.ok(rutaEntregaService.cambiarEstado(id, body.get("estadoId")));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    rutaEntregaService.disableById(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/zonas")
  public ResponseEntity<List<DeRutaZonaResumenDTO>> getZonas(@PathVariable Integer id) {
    return ResponseEntity.ok(rutaEntregaService.getZonas(id));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @PostMapping("/{id}/zonas")
  public ResponseEntity<DeRutaZonaResumenDTO> addZona(
      @PathVariable Integer id, @RequestBody DeRutaZona zona) {
    return ResponseEntity.ok(rutaEntregaService.addZona(id, zona));
  }

  @RequierePermiso(menuUrl = "/despacho/rutas", accion = Accion.ESCRIBIR)
  @DeleteMapping("/{id}/zonas/{zonaId}")
  public ResponseEntity<Void> removeZona(@PathVariable Integer id, @PathVariable Integer zonaId) {
    rutaEntregaService.removeZona(id, zonaId);
    return ResponseEntity.noContent().build();
  }
}
