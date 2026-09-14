package com.braintech.eFacturador.controllers.contabilidad;

import com.braintech.eFacturador.interfaces.contabilidad.McTipoCuentaService;
import com.braintech.eFacturador.jpa.contabilidad.McTipoCuenta;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/contabilidad/tipos-cuenta")
@RequiredArgsConstructor
public class McTipoCuentaController {

  private final McTipoCuentaService tipoCuentaService;

  /** Catálogo global y estable (< 10 registros) — sin paginar. */
  @GetMapping
  public List<McTipoCuenta> getAll() {
    return tipoCuentaService.getAll();
  }
}
