package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.jpa.general.MgItbis;
import java.util.List;

public interface MgItbisService {
  List<MgItbis> getAllActive();
}
