package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.jpa.producto.MgCategoria;
import com.braintech.eFacturador.services.producto.MgCategoriaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
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

  @PostMapping
  public MgCategoria create(@RequestBody MgCategoria mgCategoria) {
    return mgCategoriaService.create(mgCategoria);
  }

  @PutMapping("/{id}")
  public MgCategoria update(@PathVariable String id, @RequestBody MgCategoria mgCategoria) {
    return mgCategoriaService.update(id, mgCategoria);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    mgCategoriaService.delete(id);
  }
}
