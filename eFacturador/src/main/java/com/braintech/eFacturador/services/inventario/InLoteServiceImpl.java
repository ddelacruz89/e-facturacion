package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.interfaces.inventario.InLoteService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InLoteServiceImpl implements InLoteService {
  @Autowired private InLoteDao inLoteDao;

  @Override
  @Transactional
  public InLote save(InLote lote) {
    return inLoteDao.save(lote);
  }

  @Override
  public InLote findById(String lote, Long productoId) {
    return inLoteDao.findById(lote, productoId).orElse(null);
  }

  @Override
  public List<InLote> findAll() {
    return inLoteDao.findAll();
  }

  @Override
  @Transactional
  public void disableById(String lote, Long productoId) {
    inLoteDao.disableById(lote, productoId);
  }
}
