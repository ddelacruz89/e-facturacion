package com.braintech.eFacturador.interfaces.despacho;

import com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaSearchCriteria;
import com.braintech.eFacturador.dto.despacho.DeRutaZonaResumenDTO;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import com.braintech.eFacturador.jpa.despacho.DeRutaZona;
import java.util.List;
import org.springframework.data.domain.Page;

public interface DeRutaEntregaService {
  DeRutaEntrega save(DeRutaEntrega ruta);

  DeRutaEntrega findById(Integer id);

  void disableById(Integer id);

  Page<DeRutaEntregaResumenDTO> searchByCriteria(DeRutaEntregaSearchCriteria criteria);

  DeRutaEntrega asignarOrdenes(Integer rutaId, List<Integer> ordenIds);

  DeRutaEntrega asignarFacturas(Integer rutaId, List<Integer> facturaIds);

  DeRutaEntrega cambiarEstado(Integer rutaId, String estadoId);

  List<DeRutaZonaResumenDTO> getZonas(Integer rutaId);

  DeRutaZonaResumenDTO addZona(Integer rutaId, DeRutaZona zona);

  void removeZona(Integer rutaId, Integer zonaId);
}
