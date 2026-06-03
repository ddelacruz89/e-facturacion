package com.braintech.eFacturador.controllers.despacho;

import com.braintech.eFacturador.dto.despacho.DePrecioEnvioDTO;
import com.braintech.eFacturador.dto.despacho.DePrecioRequestDTO;
import com.braintech.eFacturador.interfaces.despacho.DePrecioEnvioService;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/despacho/precios-envio")
@AllArgsConstructor
public class DePrecioEnvioController {

  private final DePrecioEnvioService service;

  /**
   * Todos los precios configurados para barrios de un municipio (para poblar la tabla del módulo).
   */
  @GetMapping("/por-municipio/{municipioId}")
  public ResponseEntity<List<DePrecioEnvioDTO>> getPorMunicipio(@PathVariable Integer municipioId) {
    return ResponseEntity.ok(service.getPorMunicipio(municipioId));
  }

  /** Precio del barrio + sus sub-barrios (para DireccionSelector). */
  @GetMapping("/por-barrio/{barrioId}")
  public ResponseEntity<List<DePrecioEnvioDTO>> getPorBarrio(@PathVariable Integer barrioId) {
    return ResponseEntity.ok(service.getPorBarrio(barrioId));
  }

  /**
   * Precio efectivo de entrega para una dirección concreta. Prioridad: precio del sub-barrio >
   * precio del barrio > 0.
   */
  @GetMapping("/efectivo")
  public ResponseEntity<BigDecimal> getPrecioEfectivo(
      @RequestParam Integer barrioId, @RequestParam(required = false) Integer subBarrioId) {
    return ResponseEntity.ok(service.getPrecioEfectivo(barrioId, subBarrioId));
  }

  @RequierePermiso(menuUrl = "/despacho/precios-envio", accion = Accion.ESCRIBIR)
  @PutMapping("/barrio/{barrioId}")
  public ResponseEntity<DePrecioEnvioDTO> upsertBarrio(
      @PathVariable Integer barrioId, @RequestBody DePrecioRequestDTO body) {
    return ResponseEntity.ok(service.upsertBarrio(barrioId, body.getPrecio()));
  }

  @RequierePermiso(menuUrl = "/despacho/precios-envio", accion = Accion.ESCRIBIR)
  @PutMapping("/sub-barrio/{subBarrioId}")
  public ResponseEntity<DePrecioEnvioDTO> upsertSubBarrio(
      @PathVariable Integer subBarrioId, @RequestBody DePrecioRequestDTO body) {
    return ResponseEntity.ok(service.upsertSubBarrio(subBarrioId, body.getPrecio()));
  }

  @RequierePermiso(menuUrl = "/despacho/precios-envio", accion = Accion.ESCRIBIR)
  @DeleteMapping("/barrio/{barrioId}")
  public ResponseEntity<Void> deleteBarrio(@PathVariable Integer barrioId) {
    service.deleteBarrio(barrioId);
    return ResponseEntity.noContent().build();
  }

  @RequierePermiso(menuUrl = "/despacho/precios-envio", accion = Accion.ESCRIBIR)
  @DeleteMapping("/sub-barrio/{subBarrioId}")
  public ResponseEntity<Void> deleteSubBarrio(@PathVariable Integer subBarrioId) {
    service.deleteSubBarrio(subBarrioId);
    return ResponseEntity.noContent().build();
  }
}
