package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.interfaces.inventario.InLoteService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InLoteServiceImpl implements InLoteService {
  @Autowired private InLoteDao inLoteDao;

  @Autowired private TenantContext tenantContext;

  @Override
  @Transactional
  public InLote save(InLote lote) {
    return inLoteDao.save(lote);
  }

  @Override
  public InLote findById(String lote, Long productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inLoteDao.findById(lote, productoId, empresaId).orElse(null);
  }

  @Override
  public List<InLote> findAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inLoteDao.findAll(empresaId);
  }

  @Override
  @Transactional
  public void disableById(String lote, Long productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    inLoteDao.disableById(lote, productoId, empresaId);
  }
}
