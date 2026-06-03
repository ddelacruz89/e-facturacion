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

  /**
   * Sube la imagen del recibo de entrega al storage configurado por la empresa y guarda la URL en
   * la orden.
   *
   * @return URL donde quedó almacenado el archivo
   */
  String uploadRecibo(Integer ordenId, byte[] data, String originalFilename, String contentType);
}
