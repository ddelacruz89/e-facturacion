package com.braintech.eFacturador.controllers.despacho;

import com.braintech.eFacturador.interfaces.despacho.DeVehiculoService;
import com.braintech.eFacturador.jpa.despacho.DeVehiculo;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/despacho/vehiculos")
@AllArgsConstructor
public class DeVehiculoController {

  private final DeVehiculoService vehiculoService;

  @GetMapping
  public List<DeVehiculo> getAll() {
    return vehiculoService.findAll();
  }

  @GetMapping("/activos")
  public List<DeVehiculo> getActivos() {
    return vehiculoService.findAllActivos();
  }

  @GetMapping("/{id}")
  public ResponseEntity<DeVehiculo> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(vehiculoService.findById(id));
  }

  @RequierePermiso(menuUrl = "/despacho/vehiculos", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<DeVehiculo> create(@RequestBody DeVehiculo vehiculo) {
    return ResponseEntity.ok(vehiculoService.save(vehiculo));
  }

  @RequierePermiso(menuUrl = "/despacho/vehiculos", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<DeVehiculo> update(
      @PathVariable Integer id, @RequestBody DeVehiculo vehiculo) {
    vehiculo.setId(id);
    return ResponseEntity.ok(vehiculoService.save(vehiculo));
  }

  @RequierePermiso(menuUrl = "/despacho/vehiculos", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    vehiculoService.disableById(id);
    return ResponseEntity.noContent().build();
  }
}
