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
    return reciboDao.findAll().stream()
        .filter(r -> r.getActivo() != null && r.getActivo())
        .toList();
  }

  @Override
  public List<MfRecibos> getAll() {
    return reciboDao.findAll();
  }

  @Override
  public MfRecibos getById(Integer id) {
    return reciboDao.findById(id).orElse(null);
  }

  @Override
  public MfRecibos create(MfRecibos entity) {
    return reciboDao.save(entity);
  }

  @Override
  public MfRecibos update(Integer id, MfRecibos entity) {
    entity.setId(id);
    return reciboDao.save(entity);
  }

  @Override
  public void disable(Integer id) {
    reciboDao
        .findById(id)
        .ifPresent(
            recibo -> {
              recibo.setActivo(false);
              reciboDao.save(recibo);
            });
  }
}
