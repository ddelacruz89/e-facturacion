package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoSearchCriteria;
import com.braintech.eFacturador.dto.despacho.MisEntregasOrdenDTO;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface DeOrdenDespachoDao {

  DeOrdenDespacho save(DeOrdenDespacho orden);

  Optional<DeOrdenDespacho> findById(Integer id, Integer empresaId);

  boolean existsByFacturaId(Integer facturaId, Integer empresaId);

  void disableById(Integer id, Integer empresaId);

  Page<DeOrdenDespachoResumenDTO> searchByCriteria(
      DeOrdenDespachoSearchCriteria criteria, Integer empresaId, Integer sucursalId);

  List<MisEntregasOrdenDTO> findOrdenesByRutaId(Integer rutaId, Integer empresaId);

  List<DeOrdenDespacho> findPendientesByEmpresaAndSucursal(Integer empresaId, Integer sucursalId);

  List<DeOrdenDespacho> findByRutaId(Integer rutaId, Integer empresaId);

  List<MisEntregasOrdenDTO> findMisOrdenesDirectas(
      String conductorUsername, LocalDate fecha, Integer empresaId);
}
