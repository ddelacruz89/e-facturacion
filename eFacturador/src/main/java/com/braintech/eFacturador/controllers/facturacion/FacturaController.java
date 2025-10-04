package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.facturacion.FacturacionServices;
import com.braintech.eFacturador.services.facturacion.TipoFacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("api/facturacion")
@RestController
@RequiredArgsConstructor
public class FacturaController {
    private final FacturacionServices facturacionServices;

    @GetMapping("all")
    public ResponseEntity<Response<List<MfFactura>>> findAll() {
        Response<List<MfFactura>> response = facturacionServices.getFindByAll(1);
        return ResponseEntity.status(response.status()).body(response);
    }
    @PostMapping
    public ResponseEntity<Response<MfFactura>> save(@RequestBody MfFactura tipoFactura) {
        Response<MfFactura> response = facturacionServices.save(tipoFactura);
        return ResponseEntity.status(response.status()).body(response);
    }
}
