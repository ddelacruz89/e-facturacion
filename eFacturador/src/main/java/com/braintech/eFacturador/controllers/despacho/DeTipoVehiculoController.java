package com.braintech.eFacturador.controllers.despacho;

import com.braintech.eFacturador.interfaces.despacho.DeTipoVehiculoService;
import com.braintech.eFacturador.jpa.despacho.DeTipoVehiculo;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/despacho/tipo-vehiculo")
@AllArgsConstructor
public class DeTipoVehiculoController {

  private final DeTipoVehiculoService tipoService;

  @GetMapping
  public List<DeTipoVehiculo> getAll() {
    return tipoService.findAll();
  }

  @GetMapping("/activos")
  public List<DeTipoVehiculo> getActivos() {
    return tipoService.findAllActivos();
  }

  @GetMapping("/{id}")
  public ResponseEntity<DeTipoVehiculo> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(tipoService.findById(id));
  }

  @RequierePermiso(menuUrl = "/despacho/vehiculos", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<DeTipoVehiculo> create(@RequestBody DeTipoVehiculo tipo) {
    return ResponseEntity.ok(tipoService.save(tipo));
  }

  @RequierePermiso(menuUrl = "/despacho/vehiculos", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<DeTipoVehiculo> update(
      @PathVariable Integer id, @RequestBody DeTipoVehiculo tipo) {
    tipo.setId(id);
    return ResponseEntity.ok(tipoService.save(tipo));
  }

  @RequierePermiso(menuUrl = "/despacho/vehiculos", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    tipoService.disableById(id);
    return ResponseEntity.noContent().build();
  }
}
