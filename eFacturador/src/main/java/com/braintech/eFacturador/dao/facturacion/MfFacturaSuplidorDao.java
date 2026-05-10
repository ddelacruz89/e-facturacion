package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorSearchCriteria;
import java.util.List;

public interface MfFacturaSuplidorDao {

  List<MfFacturaSuplidorResumenDTO> buscar(
      Integer empresaId, MfFacturaSuplidorSearchCriteria criteria);
}
