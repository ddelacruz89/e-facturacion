package com.braintech.eFacturador.interfaces.contabilidad;

import com.braintech.eFacturador.jpa.contabilidad.McTipoCuenta;
import java.util.List;

public interface McTipoCuentaService {
  List<McTipoCuenta> getAll();
}
