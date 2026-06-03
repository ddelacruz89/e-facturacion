package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.despacho.DeRutaZonaRepository;
import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.dao.general.*;
import com.braintech.eFacturador.dto.facturacion.IFacturaResumen;
import com.braintech.eFacturador.dto.facturacion.MfFacturaParaDespachoDTO;
import com.braintech.eFacturador.dto.facturacion.PrecioVentaDto;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.facturacionelectronica.services.ECFServices;
import com.braintech.eFacturador.jpa.despacho.DeRutaZona;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import com.braintech.eFacturador.jpa.general.MgCliente;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import com.braintech.eFacturador.jpa.general.MgProvincia;
import com.braintech.eFacturador.jpa.general.MgSubBarrio;
import com.braintech.eFacturador.models.PagesResult;
import com.braintech.eFacturador.util.LocalDateZone;
import com.braintech.eFacturador.util.PageableUtils;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class FacturacionServices implements IFacturacion {
  private final FacturaDao facturaDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;
  private final ECFServices ecfServices;
  private final DeRutaZonaRepository rutaZonaRepository;
  private final ClienteDao clienteDao;
  private final MgProvinciaDao provinciaDao;
  private final MgMunicipioRepository municipioRepository;
  private final MgBarrioParajeRepository barrioRepository;
  private final MgSubBarrioRepository subBarrioRepository;

  @Override
  public List<MfFactura> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return facturaDao.findAllActiveByEmpresaIdAndSucursalId(empresaId, sucursalId);
  }

  @Override
  public PagesResult<List<IFacturaResumen>> getAll(int page, int size) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Pageable pageable = PageRequest.of(page, size);
    Page<IFacturaResumen> facturas = facturaDao.findAllByEmpresaPage(pageable, empresaId);
    return PageableUtils.getPagesResult(facturas);
  }

  @Override
  public MfFactura getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return facturaDao
        .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  public MfFactura getByNumeroFactura(Integer numeroFactura) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return facturaDao
        .findByNumeroFacturaAndEmpresaIdAndSucursalId(numeroFactura, empresaId, sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  @Transactional
  public MfFactura create(MfFactura entity) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer currentSucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    entity.setId(entity.getId().equals(0) ? null : entity.getId());
    entity.setEmpresaId(empresaId);
    entity.setSucursalId(currentSucursalId);
    entity.setUsuarioReg(username);
    entity.setFechaReg(LocalDateZone.toLocalDateTime());
    entity.setEstadoId("ACT");
    int nextSecuencia =
        secuenciasDao.getNextSecuencia(
            empresaId, MfFactura.class.getSimpleName().toUpperCase(Locale.ROOT));
    SecuenciaEcfResult nextSecuenciaEcf =
        secuenciasDao.getNextSecuenciaEcfValidada(empresaId, entity.getTipoComprobanteId());
    entity.setSecuencia(nextSecuencia);
    entity.setNcf(nextSecuenciaEcf.secuencia());
    entity.setFechaVencimiento(nextSecuenciaEcf.fechaValida());

    entity.getDetalles().forEach(entityDetalle -> entityDetalle.setFacturaId(entity));
    DoubleSummaryStatistics montoDescuento =
        entity.getDetalles().stream()
            .collect(Collectors.summarizingDouble(value -> this.ifNull(value.getMontoDescuento())));
    DoubleSummaryStatistics montoItbis =
        entity.getDetalles().stream()
            .collect(Collectors.summarizingDouble(value -> this.ifNull(value.getMontoItbis())));
    DoubleSummaryStatistics montoVenta =
        entity.getDetalles().stream()
            .collect(Collectors.summarizingDouble(value -> this.ifNull(value.getMontoVenta())));
    DoubleSummaryStatistics retencionIsr =
        entity.getDetalles().stream()
            .collect(Collectors.summarizingDouble(value -> this.ifNull(value.getRetencionIsr())));
    DoubleSummaryStatistics retencionItbis =
        entity.getDetalles().stream()
            .collect(Collectors.summarizingDouble(value -> this.ifNull(value.getRetencionItbis())));

    entity.setRetencionIsr(BigDecimal.valueOf(retencionIsr.getSum()));
    entity.setRetencionItbis(BigDecimal.valueOf(retencionItbis.getSum()));
    entity.setMonto(BigDecimal.valueOf(montoVenta.getSum()));
    entity.setItbis(BigDecimal.valueOf(montoItbis.getSum()));
    entity.setDescuento(BigDecimal.valueOf(montoDescuento.getSum()));
    entity.sumTotal();
    MfFactura save = facturaDao.save(entity);
    ecfServices.senderEcfFactura(save);
    return save;
  }

  private Double ifNull(BigDecimal value) {
    return value != null ? value.doubleValue() : 0.0;
  }

  @Override
  @Transactional
  public MfFactura update(Integer id, MfFactura entity) {
    //    Integer empresaId = tenantContext.getCurrentEmpresaId();
    ////    Integer sucursalId = tenantContext.getCurrentSucursalId();
    //
    //    MfFactura existing =
    //        facturaDao
    //            .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
    //            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
    //
    //    // Update fields - keep audit fields from existing
    //    entity.setId(id);
    //    entity.setEmpresaId(empresaId);
    ////        entity.setSucursalId(sucursalId);
    //    entity.setUsuarioReg(existing.getUsuarioReg());
    //    entity.setFechaReg(existing.getFechaReg());

    return facturaDao.save(entity);
  }

  @Override
  @Transactional
  public void disable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    MfFactura existing =
        facturaDao
            .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    existing.setEstadoId("INA");
    facturaDao.save(existing);
  }

  @Override
  public List<PrecioVentaDto> getProductoVenta() {
    return facturaDao.findProductoVenta();
  }

  @Override
  public void updateEfcSenderId(
      Integer id, String fechaFirma, String secuityCode, String qrUrl, String trackId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    facturaDao.updateFirmaAndQr(id, empresaId, fechaFirma, secuityCode, qrUrl, trackId);
  }

  @Override
  public List<MfFacturaParaDespachoDTO> getFacturasParaDespacho() {
    return getFacturasParaDespacho(null);
  }

  @Override
  public List<MfFacturaParaDespachoDTO> getFacturasParaDespacho(Integer rutaId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    List<MfFacturaParaDespachoDTO> todas =
        facturaDao.findFacturasParaDespacho(empresaId, sucursalId);

    if (todas.isEmpty()) return todas;

    // Cargar todos los clientes de una sola vez (batch)
    List<Integer> clienteIds =
        todas.stream()
            .map(MfFacturaParaDespachoDTO::getClienteId)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());

    Map<Integer, MgCliente> clienteMap =
        clienteDao.findAllById(clienteIds).stream()
            .collect(Collectors.toMap(MgCliente::getId, c -> c));

    // Cargar catálogos de ubicación en batch (una sola query por tabla)
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

    // Construir la dirección completa en cada factura
    todas.forEach(
        f -> {
          if (f.getClienteId() == null) return;
          MgCliente c = clienteMap.get(f.getClienteId());
          if (c == null) return;
          f.setDireccionEntrega(
              buildDireccion(
                  c, provinciaNombres, municipioNombres, barrioNombres, subBarrioNombres));
        });

    // Sin rutaId o sin zonas → devolver todas con dirección ya puesta
    if (rutaId == null) return todas;

    List<DeRutaZona> zonas = rutaZonaRepository.findByRutaId(rutaId);
    if (zonas.isEmpty()) return todas;

    // Filtrar por zonas usando el mismo clienteMap (sin query adicional)
    Set<Integer> municipiosFull =
        zonas.stream()
            .filter(z -> z.getBarrioId() == null)
            .map(DeRutaZona::getMunicipioId)
            .collect(Collectors.toSet());

    Set<Integer> barrios =
        zonas.stream()
            .filter(z -> z.getBarrioId() != null)
            .map(DeRutaZona::getBarrioId)
            .collect(Collectors.toSet());

    return todas.stream()
        .filter(
            f -> {
              if (f.getClienteId() == null) return false;
              MgCliente c = clienteMap.get(f.getClienteId());
              if (c == null) return false;
              if (c.getMunicipioId() != null && municipiosFull.contains(c.getMunicipioId()))
                return true;
              return c.getBarrioId() != null && barrios.contains(c.getBarrioId());
            })
        .collect(Collectors.toList());
  }

  /**
   * Construye la dirección de entrega completa incluyendo la jerarquía geográfica. Formato: "calle,
   * sub-barrio, barrio, municipio, provincia — referencia"
   */
  private String buildDireccion(
      MgCliente c,
      Map<String, String> provinciaNombres,
      Map<Integer, String> municipioNombres,
      Map<Integer, String> barrioNombres,
      Map<Integer, String> subBarrioNombres) {

    List<String> partes = new ArrayList<>();

    // Calle (o dirección fiscal como fallback)
    String calle =
        (c.getCalle() != null && !c.getCalle().isBlank()) ? c.getCalle() : c.getDireccion();
    if (calle != null && !calle.isBlank()) partes.add(calle);

    // Sub-barrio (nivel más específico)
    if (c.getSubBarrioId() != null) {
      String nombre = subBarrioNombres.get(c.getSubBarrioId());
      if (nombre != null) partes.add(nombre);
    }

    // Barrio / Paraje
    if (c.getBarrioId() != null) {
      String nombre = barrioNombres.get(c.getBarrioId());
      if (nombre != null) partes.add(nombre);
    }

    // Municipio
    if (c.getMunicipioId() != null) {
      String nombre = municipioNombres.get(c.getMunicipioId());
      if (nombre != null) partes.add(nombre);
    }

    // Provincia
    if (c.getCodProvincia() != null) {
      String nombre = provinciaNombres.get(c.getCodProvincia());
      if (nombre != null) partes.add(nombre);
    }

    if (partes.isEmpty()) return null;

    String direccion = String.join(", ", partes);

    // Referencia al final separada con " — "
    if (c.getReferencia() != null && !c.getReferencia().isBlank())
      direccion += " — " + c.getReferencia();

    return direccion;
  }
}
