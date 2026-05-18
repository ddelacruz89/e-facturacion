package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderSearchCriteria;
import java.util.List;

public interface MfFacturaSuplidorPagosDao {
  List<MfFacturaSuplidorPagosHeaderResumenDTO> buscar(
      Integer empresaId, MfFacturaSuplidorPagosHeaderSearchCriteria criteria);
}
