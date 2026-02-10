package com.braintech.eFacturador.controllers.cliente;

import com.braintech.eFacturador.jpa.general.MgCliente;
import com.braintech.eFacturador.services.cliente.ClienteServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("api/v1/clientes")
@RestController
@RequiredArgsConstructor
public class ClienteController {
  final ClienteServices clienteServices;

  @GetMapping("{page}/{size}")
  public ResponseEntity<?> getClientes(@PathVariable Integer page, @PathVariable Integer size) {
    return new ResponseEntity<>(clienteServices.getClientes(page, size), HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<MgCliente> createCliente(@RequestBody MgCliente cliente) {
    MgCliente createdCliente = clienteServices.create(cliente);
    return new ResponseEntity<>(createdCliente, HttpStatus.CREATED);
  }
}
