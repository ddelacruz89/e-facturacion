package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfItbisRequestDTO;
import com.braintech.eFacturador.jpa.facturacion.MfItbis;
import java.util.List;

public interface MfItbisService {

  List<MfItbis> findAll();

  MfItbis findById(Integer id);

  MfItbis save(MfItbisRequestDTO dto);

  MfItbis update(Integer id, MfItbisRequestDTO dto);
}
