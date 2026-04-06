package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenesComprasRequestDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InOrdenesCompras;
import com.braintech.eFacturador.models.Response;

public interface InOrdenesComprasService {

  Response<?> create(InOrdenesComprasRequestDTO requestDTO);

  Response<?> update(Integer id, InOrdenesCompras ordenCompra);

  Response<?> disable(Integer id);

  Response<?> getById(Integer id);

  Response<?> getByIdDebug(Integer id);

  Response<?> getAll();

  Response<?> getAllActive();

  Response<?> getAllActiveSimple();

  Response<?> searchByCriteria(InOrdenesComprasSearchCriteria criteria);

  Response<?> convertirAOrdenEntrada(Integer ordenCompraId, Integer almacenId);
}
