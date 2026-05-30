package com.braintech.eFacturador.interfaces.despacho;

import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoSearchCriteria;
import com.braintech.eFacturador.dto.despacho.MisEntregasRutaDTO;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;

public interface DeOrdenDespachoService {
  DeOrdenDespacho save(DeOrdenDespacho orden);

  DeOrdenDespacho findById(Integer id);

  void disableById(Integer id);

  Page<DeOrdenDespachoResumenDTO> searchByCriteria(DeOrdenDespachoSearchCriteria criteria);

  DeOrdenDespacho marcarEstado(Integer id, String estadoId, String notas);

  List<MisEntregasRutaDTO> getMisEntregas(LocalDate fecha);

  List<DeOrdenDespacho> findPendientes();
}
