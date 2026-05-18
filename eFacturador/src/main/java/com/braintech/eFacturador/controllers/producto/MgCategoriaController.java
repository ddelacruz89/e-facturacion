package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.dto.producto.MgCategoriaSimpleDTO;
import com.braintech.eFacturador.jpa.producto.MgCategoria;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.producto.MgCategoriaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/producto/categoria")
public class MgCategoriaController {

  @Autowired private MgCategoriaService mgCategoriaService;

  @GetMapping
  public List<MgCategoria> getAllActive() {
    return mgCategoriaService.getAllActive();
  }

  @GetMapping("/all")
  public List<MgCategoria> getAll() {
    return mgCategoriaService.getAll();
  }

  @GetMapping("/{id}")
  public MgCategoria getById(@PathVariable String id) {
    return mgCategoriaService.getById(id);
  }

  @RequierePermiso(menuUrl = "/producto/categoria", accion = Accion.ESCRIBIR)
  @PostMapping
  public MgCategoria create(@RequestBody MgCategoria mgCategoria) {
    return mgCategoriaService.create(mgCategoria);
  }

  @RequierePermiso(menuUrl = "/producto/categoria", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public MgCategoria update(@PathVariable Integer id, @RequestBody MgCategoria mgCategoria) {
    return mgCategoriaService.update(id, mgCategoria);
  }

  @RequierePermiso(menuUrl = "/producto/categoria", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Integer id) {
    mgCategoriaService.delete(id);
  }

  @GetMapping("/resumen")
  public ResponseEntity<List<MgCategoriaSimpleDTO>> getAllSimpleCategorias() {
    return ResponseEntity.ok(mgCategoriaService.getAllSimple());
  }
}
