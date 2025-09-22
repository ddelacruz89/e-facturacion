package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.facturacion.TipoFacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("api/facturacion/tipo")
@RestController
@RequiredArgsConstructor
public class TipoFacturaController {
    private final TipoFacturaService tipoFacturaService;

    @GetMapping("all")
    public ResponseEntity<Response<List<MgTipoFactura>>> findAll() {
        Response<List<MgTipoFactura>> response = tipoFacturaService.findAll();
        return ResponseEntity.status(response.status()).body(response);
    }
    @PostMapping
    public ResponseEntity<Response<MgTipoFactura>> save(@RequestBody MgTipoFactura tipoFactura) {
        Response<MgTipoFactura> response = tipoFacturaService.save(tipoFactura);
        return ResponseEntity.status(response.status()).body(response);
    }
}
