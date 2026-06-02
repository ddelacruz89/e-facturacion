package com.braintech.eFacturador.services.despacho;

import com.braintech.eFacturador.dao.despacho.DeOrdenDespachoDao;
import com.braintech.eFacturador.dao.despacho.DeRutaEntregaDao;
import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.dao.general.ClienteDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.despacho.DeRutaEntregaService;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.general.MgCliente;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class DeRutaEntregaServiceImpl implements DeRutaEntregaService {

  private final DeRutaEntregaDao rutaEntregaDao;
  private final DeOrdenDespachoDao ordenDespachoDao;
  private final FacturaDao facturaDao;
  private final ClienteDao clienteDao;
  private final SgSucursalRepository sucursalRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public DeRutaEntrega save(DeRutaEntrega ruta) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    boolean isNew = ruta.getId() == null;

    ruta.setEmpresaId(empresaId);
    ruta.setSucursalId(sucursal);

    if (isNew) {
      ruta.setFechaReg(LocalDateTime.now());
      ruta.setUsuarioReg(username);
      ruta.setEstadoId("PLANIFICADA");
    }

    DeRutaEntrega saved = rutaEntregaDao.save(ruta);

    if (isNew) {
      int seq =
          secuenciasDao.getNextSecuencia(
              empresaId, DeRutaEntrega.class.getSimpleName().toUpperCase(Locale.ROOT));
      saved.setSecuencia(seq);
      saved = rutaEntregaDao.save(saved);
    }

    return saved;
  }

  @Override
  public DeRutaEntrega findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return rutaEntregaDao
        .findById(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Ruta de entrega no encontrada: " + id));
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    DeRutaEntrega ruta =
        rutaEntregaDao
            .findById(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Ruta de entrega no encontrada: " + id));

    if ("COMPLETADA".equals(ruta.getEstadoId())) {
      throw new IllegalStateException("No se puede anular una ruta ya completada.");
    }

    List<DeOrdenDespacho> ordenes = ordenDespachoDao.findByRutaId(id, empresaId);
    for (DeOrdenDespacho orden : ordenes) {
      if (!"ENTREGADO".equals(orden.getEstadoId()) && !"ANU".equals(orden.getEstadoId())) {
        orden.setRutaId(null);
        orden.setEstadoId("PEN");
        ordenDespachoDao.save(orden);
      }
    }

    rutaEntregaDao.disableById(id, empresaId);
  }

  @Override
  public Page<DeRutaEntregaResumenDTO> searchByCriteria(DeRutaEntregaSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return rutaEntregaDao.searchByCriteria(criteria, empresaId, sucursalId);
  }

  @Override
  @Transactional
  public DeRutaEntrega asignarOrdenes(Integer rutaId, List<Integer> ordenIds) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    DeRutaEntrega ruta =
        rutaEntregaDao
            .findById(rutaId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Ruta no encontrada: " + rutaId));

    if ("ANU".equals(ruta.getEstadoId()) || "COMPLETADA".equals(ruta.getEstadoId())) {
      throw new IllegalStateException(
          "No se puede asignar órdenes a una ruta " + ruta.getEstadoId());
    }

    for (Integer ordenId : ordenIds) {
      ordenDespachoDao
          .findById(ordenId, empresaId)
          .ifPresent(
              orden -> {
                orden.setRutaId(rutaId);
                orden.setEstadoId("EN_RUTA");
                ordenDespachoDao.save(orden);
              });
    }

    return ruta;
  }

  @Override
  @Transactional
  public DeRutaEntrega asignarFacturas(Integer rutaId, List<Integer> facturaIds) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    DeRutaEntrega ruta =
        rutaEntregaDao
            .findById(rutaId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Ruta no encontrada: " + rutaId));

    if ("ANU".equals(ruta.getEstadoId()) || "COMPLETADA".equals(ruta.getEstadoId())) {
      throw new IllegalStateException(
          "No se puede asignar órdenes a una ruta " + ruta.getEstadoId());
    }

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    for (Integer facturaId : facturaIds) {
      if (ordenDespachoDao.existsByFacturaId(facturaId, empresaId)) continue;

      MfFactura factura =
          facturaDao
              .findById(facturaId)
              .orElseThrow(
                  () -> new RecordNotFoundException("Factura no encontrada: " + facturaId));

      DeOrdenDespacho orden = new DeOrdenDespacho();
      orden.setEmpresaId(empresaId);
      orden.setSucursalId(sucursal);
      orden.setFacturaId(facturaId);
      orden.setFacturaSecuencia(factura.getSecuencia());
      orden.setClienteId(factura.getClienteId());
      orden.setClienteNombre(factura.getRazonSocial());
      orden.setFechaCompromiso(ruta.getFecha().atTime(23, 59));
      orden.setRutaId(rutaId);
      orden.setEstadoId("EN_RUTA");
      orden.setFechaReg(LocalDateTime.now());
      orden.setUsuarioReg(username);

      // Pre-llenar teléfono y dirección de entrega desde el registro del cliente
      if (factura.getClienteId() != null) {
        clienteDao
            .findById(factura.getClienteId())
            .ifPresent(
                cliente -> {
                  orden.setClienteTelefono(cliente.getTelefono());
                  orden.setDireccionEntrega(buildDireccionEntrega(cliente));
                });
      }

      DeOrdenDespacho saved = ordenDespachoDao.save(orden);
      int seq =
          secuenciasDao.getNextSecuencia(
              empresaId, DeOrdenDespacho.class.getSimpleName().toUpperCase(Locale.ROOT));
      saved.setSecuencia(seq);
      ordenDespachoDao.save(saved);
    }

    return ruta;
  }

  /**
   * Construye la cadena de dirección de entrega a partir de los campos estructurados del cliente.
   * Usa calle si está disponible; si no, cae a la dirección fiscal. Agrega referencia al final si
   * existe.
   */
  private String buildDireccionEntrega(MgCliente cliente) {
    StringBuilder sb = new StringBuilder();
    String base =
        (cliente.getCalle() != null && !cliente.getCalle().isBlank())
            ? cliente.getCalle()
            : cliente.getDireccion();
    if (base != null && !base.isBlank()) sb.append(base);
    if (cliente.getReferencia() != null && !cliente.getReferencia().isBlank()) {
      sb.append(sb.isEmpty() ? "" : " — ").append(cliente.getReferencia());
    }
    return sb.isEmpty() ? null : sb.toString();
  }

  @Override
  @Transactional
  public DeRutaEntrega cambiarEstado(Integer rutaId, String estadoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    DeRutaEntrega ruta =
        rutaEntregaDao
            .findById(rutaId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Ruta no encontrada: " + rutaId));

    if ("PLANIFICADA".equals(estadoId)) {
      boolean tieneEntregadas =
          ordenDespachoDao.findByRutaId(rutaId, empresaId).stream()
              .anyMatch(o -> "ENTREGADO".equals(o.getEstadoId()));
      if (tieneEntregadas) {
        throw new IllegalStateException(
            "No se puede regresar a Planificada: ya hay órdenes entregadas en esta ruta.");
      }
    }

    ruta.setEstadoId(estadoId);
    return rutaEntregaDao.save(ruta);
  }
}
