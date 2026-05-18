package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorFormaPagoRequestDTO;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import java.util.List;

public interface MfFacturaSuplidorFormaPagoService {
  List<MfFacturaSuplidorFormaPago> findAll();
  List<MfFacturaSuplidorFormaPago> findActivos();
  MfFacturaSuplidorFormaPago findById(Integer id);
  MfFacturaSuplidorFormaPago save(MfFacturaSuplidorFormaPagoRequestDTO dto);
  MfFacturaSuplidorFormaPago update(Integer id, MfFacturaSuplidorFormaPagoRequestDTO dto);
}
