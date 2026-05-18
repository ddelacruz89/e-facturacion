package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisResumenDTO;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import java.util.List;

public interface MgRetencionItbisService {

  /** Todos los registros como resumen para listados/dropdowns. */
  List<MgRetencionItbisResumenDTO> findAll();

  /** Filtrado por tipo de retención: "ITBIS" o "ISR". */
  List<MgRetencionItbisResumenDTO> findByTipo(String tipoRetencion);

  /** Carga el objeto completo (con FK lazy resueltas) por ID. */
  MgRetencionItbis findById(Integer id);

  /** Crea un nuevo registro. */
  MgRetencionItbis save(MgRetencionItbisRequestDTO dto);

  /** Actualiza los campos editables de un registro existente. */
  MgRetencionItbis update(Integer id, MgRetencionItbisRequestDTO dto);

  /** Elimina un registro por ID. */
  void delete(Integer id);
}
