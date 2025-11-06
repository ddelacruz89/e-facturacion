package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InOrdenEntradaDao;
import com.braintech.eFacturador.interfaces.inventario.InOrdenEntradaService;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InOrdenEntradaServiceImpl implements InOrdenEntradaService {
  @Autowired private InOrdenEntradaDao inOrdenEntradaDao;

  @Autowired private TenantContext tenantContext;

  @Override
  @Transactional
  public InOrdenEntrada save(InOrdenEntrada ordenEntrada) {
    return inOrdenEntradaDao.save(ordenEntrada);
  }

  @Override
  public InOrdenEntrada findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inOrdenEntradaDao.findById(id, empresaId).orElse(null);
  }

  @Override
  public List<InOrdenEntrada> findAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inOrdenEntradaDao.findAll(empresaId);
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    inOrdenEntradaDao.disableById(id, empresaId);
  }
}
