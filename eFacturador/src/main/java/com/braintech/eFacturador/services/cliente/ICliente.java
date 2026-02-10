package com.braintech.eFacturador.services.cliente;

import com.braintech.eFacturador.jpa.general.MgCliente;
import com.braintech.eFacturador.models.PagesResult;
import java.util.Optional;

public interface ICliente {
  Optional<MgCliente> getById(Integer id);

  MgCliente create(MgCliente entity);

  MgCliente update(Integer id, MgCliente entity);

  PagesResult getClientes(Integer page, Integer size);
}
