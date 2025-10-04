package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dao.facturacion.TipoComprobanteDao;
import com.braintech.eFacturador.jpa.facturacion.MgTipoComprobante;
import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.facturacion.TipoComprobanteServices;
import com.braintech.eFacturador.services.facturacion.TipoFacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("api/facturacion/tipo/comprobante")
@RestController
@RequiredArgsConstructor
public class TipoComprobanteController {
    private final TipoComprobanteServices tipoComprobanteServices;

    @GetMapping("all")
    public ResponseEntity<Response<List<MgTipoComprobante>>> findAll() {
        Response<List<MgTipoComprobante>> response = tipoComprobanteServices.findAll();
        return ResponseEntity.status(response.status()).body(response);
    }
    @PostMapping
    public ResponseEntity<Response<MgTipoComprobante>> save(@RequestBody MgTipoComprobante tipoComprobante) {
        Response<MgTipoComprobante> response = tipoComprobanteServices.save(tipoComprobante);
        return ResponseEntity.status(response.status()).body(response);
    }
}
