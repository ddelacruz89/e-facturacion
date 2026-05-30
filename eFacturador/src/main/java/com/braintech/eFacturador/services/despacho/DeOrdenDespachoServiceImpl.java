package com.braintech.eFacturador.services.despacho;

import com.braintech.eFacturador.dao.despacho.DeOrdenDespachoDao;
import com.braintech.eFacturador.dao.despacho.DeRutaEntregaDao;
import com.braintech.eFacturador.dao.despacho.DeVehiculoRepository;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeOrdenDespachoSearchCriteria;
import com.braintech.eFacturador.dto.despacho.MisEntregasOrdenDTO;
import com.braintech.eFacturador.dto.despacho.MisEntregasRutaDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.despacho.DeOrdenDespachoService;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import com.braintech.eFacturador.jpa.despacho.DeVehiculo;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class DeOrdenDespachoServiceImpl implements DeOrdenDespachoService {

  private final DeOrdenDespachoDao ordenDespachoDao;
  private final DeRutaEntregaDao rutaEntregaDao;
  private final DeVehiculoRepository vehiculoRepository;
  private final SgSucursalRepository sucursalRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public DeOrdenDespacho save(DeOrdenDespacho orden) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    boolean isNew = orden.getId() == null;

    if (isNew && ordenDespachoDao.existsByFacturaId(orden.getFacturaId(), empresaId)) {
      throw new IllegalStateException(
          "Ya existe una orden de despacho activa para la factura #" + orden.getFacturaSecuencia());
    }

    orden.setEmpresaId(empresaId);
    orden.setSucursalId(sucursal);

    if (isNew) {
      orden.setFechaReg(LocalDateTime.now());
      orden.setUsuarioReg(username);
      orden.setEstadoId("PEN");
    }

    DeOrdenDespacho saved = ordenDespachoDao.save(orden);

    if (isNew) {
      int seq =
          secuenciasDao.getNextSecuencia(
              empresaId, DeOrdenDespacho.class.getSimpleName().toUpperCase(Locale.ROOT));
      saved.setSecuencia(seq);
      saved = ordenDespachoDao.save(saved);
    }

    return saved;
  }

  @Override
  public DeOrdenDespacho findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return ordenDespachoDao
        .findById(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Orden de despacho no encontrada: " + id));
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    DeOrdenDespacho orden =
        ordenDespachoDao
            .findById(id, empresaId)
            .orElseThrow(
                () -> new RecordNotFoundException("Orden de despacho no encontrada: " + id));

    if ("ENTREGADO".equals(orden.getEstadoId())) {
      throw new IllegalStateException("No se puede anular una orden ya entregada.");
    }

    ordenDespachoDao.disableById(id, empresaId);
  }

  @Override
  public Page<DeOrdenDespachoResumenDTO> searchByCriteria(DeOrdenDespachoSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return ordenDespachoDao.searchByCriteria(criteria, empresaId, sucursalId);
  }

  @Override
  @Transactional
  public DeOrdenDespacho marcarEstado(Integer id, String estadoId, String notas) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    DeOrdenDespacho orden =
        ordenDespachoDao
            .findById(id, empresaId)
            .orElseThrow(
                () -> new RecordNotFoundException("Orden de despacho no encontrada: " + id));

    validarTransicionEstado(orden.getEstadoId(), estadoId);

    orden.setEstadoId(estadoId);

    if (notas != null && !notas.isBlank()) {
      orden.setNotas(notas);
    }

    if ("ENTREGADO".equals(estadoId)) {
      orden.setFechaEntrega(LocalDateTime.now());
      orden.setUsuarioEntrego(username);
    }

    return ordenDespachoDao.save(orden);
  }

  @Override
  public List<MisEntregasRutaDTO> getMisEntregas(LocalDate fecha) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    List<DeRutaEntrega> rutas = rutaEntregaDao.findByFechaAndConductor(fecha, username, empresaId);

    List<MisEntregasRutaDTO> result = new ArrayList<>();

    for (DeRutaEntrega ruta : rutas) {
      MisEntregasRutaDTO dto = new MisEntregasRutaDTO();
      dto.setRutaId(ruta.getId());
      dto.setRutaSecuencia(ruta.getSecuencia());
      dto.setFecha(ruta.getFecha());
      dto.setEstadoRuta(ruta.getEstadoId());

      Optional<DeVehiculo> vehiculo =
          vehiculoRepository.findByIdAndEmpresaId(ruta.getVehiculoId(), empresaId);
      vehiculo.ifPresent(
          v -> {
            dto.setVehiculoDescripcion(v.getDescripcion());
            dto.setVehiculoPlaca(v.getPlaca());
          });

      List<MisEntregasOrdenDTO> ordenes =
          ordenDespachoDao.findOrdenesByRutaId(ruta.getId(), empresaId);
      dto.setOrdenes(ordenes);

      result.add(dto);
    }

    return result;
  }

  @Override
  public List<DeOrdenDespacho> findPendientes() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return ordenDespachoDao.findPendientesByEmpresaAndSucursal(empresaId, sucursalId);
  }

  private void validarTransicionEstado(String estadoActual, String estadoNuevo) {
    if ("ANU".equals(estadoActual)) {
      throw new IllegalStateException("No se puede cambiar el estado de una orden anulada.");
    }
    if ("ENTREGADO".equals(estadoActual) && !"DEVUELTO".equals(estadoNuevo)) {
      throw new IllegalStateException("Una orden entregada solo puede marcarse como devuelta.");
    }
  }
}
