package com.braintech.eFacturador.services.contabilidad;

import com.braintech.eFacturador.dao.contabilidad.McTipoCuentaDao;
import com.braintech.eFacturador.interfaces.contabilidad.McTipoCuentaService;
import com.braintech.eFacturador.jpa.contabilidad.McTipoCuenta;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class McTipoCuentaServiceImpl implements McTipoCuentaService {

  private final McTipoCuentaDao tipoCuentaDao;

  @Override
  public List<McTipoCuenta> getAll() {
    return tipoCuentaDao.findAll();
  }
}
