package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.ReciboDao;
import com.braintech.eFacturador.jpa.facturacion.MfRecibos;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReciboService implements IRecibo {
  private final ReciboDao reciboDao;

  @Override
  public List<MfRecibos> getAllActive() {
    return List.of();
  }

  @Override
  public List<MfRecibos> getAll() {
    return null;
  }

  @Override
  public MfRecibos getById(Integer id) {
    return null;
  }

  @Override
  public MfRecibos create(MfRecibos entity) {
    return null;
  }

  @Override
  public MfRecibos update(Integer id, MfRecibos entity) {
    return null;
  }

  @Override
  public void disable(Integer id) {}
}
