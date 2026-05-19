package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorSearchCriteria;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import java.util.List;

public interface MfFacturaSuplidorService {

  /** Búsqueda paginada con filtros — devuelve proyección de resumen. */
  List<MfFacturaSuplidorResumenDTO> buscar(MfFacturaSuplidorSearchCriteria criteria);

  /** Objeto completo con detalles por ID interno. */
  MfFacturaSuplidor findById(Integer id);

  /** Objeto completo por secuencia (número visible al usuario, scoped a la empresa del JWT). */
  MfFacturaSuplidor findBySecuencia(Integer secuencia);

  /** Crear nueva factura suplidor con sus detalles. */
  MfFacturaSuplidor save(MfFacturaSuplidorRequestDTO dto);

  /** Actualizar factura suplidor existente. */
  MfFacturaSuplidor update(Integer id, MfFacturaSuplidorRequestDTO dto);
}
