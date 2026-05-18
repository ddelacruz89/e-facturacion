package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderSearchCriteria;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorPagosHeader;
import java.util.List;

public interface MfFacturaSuplidorPagosService {

  List<MfFacturaSuplidorPagosHeaderResumenDTO> buscar(
      MfFacturaSuplidorPagosHeaderSearchCriteria criteria);

  MfFacturaSuplidorPagosHeader findById(Integer id);

  MfFacturaSuplidorPagosHeader save(MfFacturaSuplidorPagosHeaderRequestDTO dto);

  MfFacturaSuplidorPagosHeader update(Integer id, MfFacturaSuplidorPagosHeaderRequestDTO dto);

  MfFacturaSuplidorPagosHeader anular(Integer id);

  List<MfFacturaSuplidorFormaPago> findFormasPago();
}
