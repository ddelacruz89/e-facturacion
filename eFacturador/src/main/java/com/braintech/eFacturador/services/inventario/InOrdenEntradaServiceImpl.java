package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InOrdenEntradaDao;
import com.braintech.eFacturador.interfaces.inventario.InOrdenEntradaService;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InOrdenEntradaServiceImpl implements InOrdenEntradaService {
  @Autowired private InOrdenEntradaDao inOrdenEntradaDao;

  @Override
  @Transactional
  public InOrdenEntrada save(InOrdenEntrada ordenEntrada) {
    return inOrdenEntradaDao.save(ordenEntrada);
  }

  @Override
  public InOrdenEntrada findById(Integer id) {
    return inOrdenEntradaDao.findById(id).orElse(null);
  }

  @Override
  public List<InOrdenEntrada> findAll() {
    return inOrdenEntradaDao.findAll();
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    inOrdenEntradaDao.disableById(id);
  }
}
