package com.braintech.eFacturador.services.despacho;

import com.braintech.eFacturador.dao.despacho.DeOrdenDespachoDao;
import com.braintech.eFacturador.dao.despacho.DeRutaEntregaDao;
import com.braintech.eFacturador.dao.despacho.DeRutaZonaDaoImpl;
import com.braintech.eFacturador.dao.despacho.DeRutaZonaRepository;
import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.dao.general.ClienteDao;
import com.braintech.eFacturador.dao.general.MgBarrioParajeRepository;
import com.braintech.eFacturador.dao.general.MgMunicipioRepository;
import com.braintech.eFacturador.dao.general.MgProvinciaDao;
import com.braintech.eFacturador.dao.general.MgSubBarrioRepository;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaResumenDTO;
import com.braintech.eFacturador.dto.despacho.DeRutaEntregaSearchCriteria;
import com.braintech.eFacturador.dto.despacho.DeRutaZonaResumenDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.despacho.DeRutaEntregaService;
import com.braintech.eFacturador.jpa.despacho.DeOrdenDespacho;
import com.braintech.eFacturador.jpa.despacho.DeRutaEntrega;
import com.braintech.eFacturador.jpa.despacho.DeRutaZona;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import com.braintech.eFacturador.jpa.general.MgCliente;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import com.braintech.eFacturador.jpa.general.MgProvincia;
import com.braintech.eFacturador.jpa.general.MgSubBarrio;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
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
  private final DeRutaZonaRepository rutaZonaRepository;
  private final DeRutaZonaDaoImpl rutaZonaDao;
  private final MgProvinciaDao provinciaDao;
  private final MgMunicipioRepository municipioRepository;
  private final MgBarrioParajeRepository barrioRepository;
  private final MgSubBarrioRepository subBarrioRepository;

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

    // Cargar catálogos geográficos en batch para construir la dirección completa
    List<Integer> clienteIds =
        facturaIds.stream()
            .map(fid -> facturaDao.findById(fid).map(MfFactura::getClienteId).orElse(null))
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());

    Map<Integer, MgCliente> clienteMap =
        clienteDao.findAllById(clienteIds).stream()
            .collect(Collectors.toMap(MgCliente::getId, c -> c));

    Map<String, String> provinciaNombres =
        provinciaDao.findAll().stream()
            .collect(Collectors.toMap(MgProvincia::getCodProvincia, MgProvincia::getNombre));

    Set<Integer> municipioIds =
        clienteMap.values().stream()
            .map(MgCliente::getMunicipioId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    Map<Integer, String> municipioNombres =
        municipioRepository.findAllById(municipioIds).stream()
            .collect(Collectors.toMap(MgMunicipio::getId, MgMunicipio::getNombre));

    Set<Integer> barrioIds =
        clienteMap.values().stream()
            .map(MgCliente::getBarrioId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    Map<Integer, String> barrioNombres =
        barrioRepository.findAllById(barrioIds).stream()
            .collect(Collectors.toMap(MgBarrioParaje::getId, MgBarrioParaje::getNombre));

    Set<Integer> subBarrioIds =
        clienteMap.values().stream()
            .map(MgCliente::getSubBarrioId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    Map<Integer, String> subBarrioNombres =
        subBarrioRepository.findAllById(subBarrioIds).stream()
            .collect(Collectors.toMap(MgSubBarrio::getId, MgSubBarrio::getNombre));

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

      if (factura.getClienteId() != null) {
        MgCliente cliente = clienteMap.get(factura.getClienteId());
        if (cliente != null) {
          orden.setClienteTelefono(cliente.getTelefono());
          orden.setDireccionEntrega(
              buildDireccionEntrega(
                  cliente, provinciaNombres, municipioNombres, barrioNombres, subBarrioNombres));
        }
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

  private String buildDireccionEntrega(
      MgCliente c,
      Map<String, String> provinciaNombres,
      Map<Integer, String> municipioNombres,
      Map<Integer, String> barrioNombres,
      Map<Integer, String> subBarrioNombres) {

    List<String> partes = new ArrayList<>();

    String calle =
        (c.getCalle() != null && !c.getCalle().isBlank()) ? c.getCalle() : c.getDireccion();
    if (calle != null && !calle.isBlank()) partes.add(calle);

    if (c.getSubBarrioId() != null) {
      String nombre = subBarrioNombres.get(c.getSubBarrioId());
      if (nombre != null) partes.add(nombre);
    }

    if (c.getBarrioId() != null) {
      String nombre = barrioNombres.get(c.getBarrioId());
      if (nombre != null) partes.add(nombre);
    }

    if (c.getMunicipioId() != null) {
      String nombre = municipioNombres.get(c.getMunicipioId());
      if (nombre != null) partes.add(nombre);
    }

    if (c.getCodProvincia() != null) {
      String nombre = provinciaNombres.get(c.getCodProvincia());
      if (nombre != null) partes.add(nombre);
    }

    if (partes.isEmpty()) return null;

    String direccion = String.join(", ", partes);

    if (c.getReferencia() != null && !c.getReferencia().isBlank())
      direccion += " — " + c.getReferencia();

    return direccion;
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

  @Override
  public List<DeRutaZonaResumenDTO> getZonas(Integer rutaId) {
    return rutaZonaDao.findZonasConNombres(rutaId);
  }

  @Override
  @Transactional
  public DeRutaZonaResumenDTO addZona(Integer rutaId, DeRutaZona zona) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    rutaEntregaDao
        .findById(rutaId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Ruta no encontrada: " + rutaId));

    zona.setRutaId(rutaId);
    rutaZonaRepository.save(zona);
    return rutaZonaDao.findZonasConNombres(rutaId).stream()
        .filter(z -> z.getId().equals(zona.getId()))
        .findFirst()
        .orElse(null);
  }

  @Override
  @Transactional
  public void removeZona(Integer rutaId, Integer zonaId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    rutaEntregaDao
        .findById(rutaId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Ruta no encontrada: " + rutaId));

    rutaZonaRepository
        .findById(zonaId)
        .filter(z -> z.getRutaId().equals(rutaId))
        .ifPresent(rutaZonaRepository::delete);
  }
}
