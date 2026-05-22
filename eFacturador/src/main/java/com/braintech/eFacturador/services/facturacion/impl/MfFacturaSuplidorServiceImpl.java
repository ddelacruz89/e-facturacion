package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorDao;
import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorRepository;
import com.braintech.eFacturador.dao.general.SecuenciaEcfResult;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorDetalleDescuentoRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorDetalleRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.facturacionelectronica.services.ECFServices;
import com.braintech.eFacturador.interfaces.inventario.InSuplidorService;
import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorDetalle;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorDetalleDescuento;
import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.services.facturacion.MfFacturaSuplidorService;
import com.braintech.eFacturador.util.TenantContext;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class MfFacturaSuplidorServiceImpl implements MfFacturaSuplidorService {

  private final MfFacturaSuplidorRepository repository;
  private final MfFacturaSuplidorDao dao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;
  private final InSuplidorService suplidorService;

  @Lazy @Autowired private ECFServices ecfServices;

  // ── Buscar ────────────────────────────────────────────────────────────────

  @Override
  public List<MfFacturaSuplidorResumenDTO> buscar(MfFacturaSuplidorSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return dao.buscar(empresaId, criteria);
  }

  // ── FindById ──────────────────────────────────────────────────────────────

  @Override
  public MfFacturaSuplidor findById(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Factura suplidor no encontrada: " + id));
  }

  @Override
  public MfFacturaSuplidor findBySecuencia(Integer secuencia) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return repository
        .findByEmpresaIdAndSecuencia(empresaId, secuencia)
        .orElseThrow(
            () ->
                new RecordNotFoundException(
                    "Factura suplidor no encontrada con secuencia: " + secuencia));
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public MfFacturaSuplidor save(MfFacturaSuplidorRequestDTO dto) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MfFacturaSuplidor entity = new MfFacturaSuplidor();
    InSuplidor suplidor = suplidorService.findById(dto.getSuplidorId());
    mapHeader(dto, entity);
    mapDetalles(dto, entity);

    MfFacturaSuplidor saved = repository.save(entity);
    saved.setSuplidor(suplidor);
    int seq =
        secuenciasDao.getNextSecuencia(
            saved.getEmpresaId(), MfFacturaSuplidor.class.getSimpleName().toUpperCase(Locale.ROOT));
    saved.setSecuencia(seq);
    SecuenciaEcfResult ecfResult =
        secuenciasDao.getNextSecuenciaEcfValidada(empresaId, entity.getTipoComprobanteId());
    String ncf =
        "E" + entity.getTipoComprobanteId() + String.format("%010d", ecfResult.secuencia());
    saved.setNcf(ncf);
    if (ecfResult.fechaValida() != null) {
      saved.setFechaValido(ecfResult.fechaValida().atStartOfDay());
    }
    ecfServices.senderEcfTerceros(saved, false);
    return repository.save(saved);
  }

  /**
   * Crear nueva factura suplidor con sus detalles.
   *
   * @param facturaSuplidor
   */
  @Override
  public MfFacturaSuplidor saveFactura(MfFacturaSuplidor facturaSuplidor) {
    return repository.save(facturaSuplidor);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public MfFacturaSuplidor update(Integer id, MfFacturaSuplidorRequestDTO dto) {
    MfFacturaSuplidor entity = findById(id);
    mapHeader(dto, entity);
    // Reemplaza los detalles existentes (orphanRemoval = true los elimina)
    entity.getDetalles().clear();
    mapDetalles(dto, entity);
    return repository.save(entity);
  }

  @Override
  @jakarta.transaction.Transactional
  public Integer checkAndUpdateAprobadaFromQrUrl(Integer facturaId) {
    MfFacturaSuplidor factura =
        repository
            .findById(facturaId)
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Factura suplidor informal no encontrada id=" + facturaId));

    RestTemplate restTemplate = new RestTemplate();
    Pattern aceptadoPattern =
        Pattern.compile(
            "<th[^>]*>\\s*Estado\\s*</th>\\s*<td[^>]*>\\s*Aceptado\\s*</td>",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    return checkAndUpdateAprobadaFromQrUrlInternal(factura, restTemplate, aceptadoPattern);
  }

  private Integer checkAndUpdateAprobadaFromQrUrlInternal(
      MfFacturaSuplidor factura, RestTemplate restTemplate, Pattern aceptadoPattern) {

    String url = factura.getQrUrl();
    if (url == null || url.isBlank()) {
      log.warn("Factura suplidor informal id={} tiene qrUrl vacío, se omite", factura.getId());
      // si no hay URL, devolvemos estado basado en el valor actual
      return (factura.getAprobada() != null && factura.getAprobada()) ? 1 : 0;
    }

    try {
      // Importante: usar URI para evitar que RestTemplate vuelva a codificar
      // los parámetros ya codificados (%20, etc.). Si se pasara el String
      // directamente, RestTemplate podría transformar "%20" en "%2520" y
      // DGII respondería "No fue encontrada la factura".
      URI uri = new URI(url);
      ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);

      if (!response.getStatusCode().is2xxSuccessful()) {
        log.warn(
            "Respuesta HTTP no exitosa al consultar QR URL para factura id={} status={}",
            factura.getId(),
            response.getStatusCode());
        return (factura.getAprobada() != null && factura.getAprobada()) ? 1 : 0;
      }

      String body = response.getBody();
      if (body == null || body.isBlank()) {
        log.warn("Respuesta vacía al consultar QR URL para factura id={}", factura.getId());
        return (factura.getAprobada() != null && factura.getAprobada()) ? 1 : 0;
      }

      if (aceptadoPattern.matcher(body).find()) {
        factura.setAprobada(true);
        repository.save(factura);
        log.info(
            "Factura suplidor informal id={} marcada como aprobada (aprobada=1) por respuesta QR",
            factura.getId());
      } else {
        // Si no se encuentra el estado Aceptado, se marca explícitamente como no aprobada (0)
        factura.setAprobada(false);
        repository.save(factura);

        // Logueamos un pequeño fragmento del HTML para facilitar el diagnóstico
        String snippet = body.length() > 300 ? body.substring(0, 300) + "..." : body;
        log.info(
            "Factura suplidor informal id={} marcada como NO aprobada (aprobada=0). Fragmento respuesta: {}",
            factura.getId(),
            snippet);
      }
    } catch (URISyntaxException | RestClientException ex) {
      log.error(
          "Error al consultar QR URL '{}' para factura suplidor informal id={}",
          url,
          factura.getId(),
          ex);
    }

    return (factura.getAprobada() != null && factura.getAprobada()) ? 1 : 0;
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private void mapHeader(MfFacturaSuplidorRequestDTO dto, MfFacturaSuplidor e) {
    // Tenant — siempre desde el contexto, nunca del cliente
    e.setEmpresaId(tenantContext.getCurrentEmpresaId());
    e.setSucursalId(tenantContext.getCurrentSucursalId());
    e.setUsuarioReg(tenantContext.getCurrentUsername());
    if (e.getFechaReg() == null) {
      e.setFechaReg(LocalDateTime.now());
    }

    // DgII fields
    e.setNcf(dto.getNcf());
    e.setTipoComprobanteId(dto.getTipoCfId());
    e.setSecuityCode(dto.getSecuityCode());
    e.setTrackId(dto.getTrackId());
    e.setQrUrl(dto.getQrUrl());
    e.setFechaFirma(dto.getFechaFirma());
    e.setAprobada(dto.getAprobada());
    e.setRazonSocial(dto.getRazonSocial());
    e.setRnc(dto.getRnc());

    // Identificación
    e.setNumeroFactura(dto.getNumeroFactura());
    e.setTipoIngreso(dto.getTipoIngreso());
    e.setFechaEmision(dto.getFechaEmision());
    e.setFechaLimitePago(dto.getFechaLimitePago());
    e.setFechaVencimiento(dto.getFechaVencimiento());
    e.setFechaPago(dto.getFechaPago());
    e.setFacturaFechaManual(dto.getFacturaFechaManual());
    e.setEstadoId(dto.getEstadoId());

    // Suplidor — referencia por proxy ID (sin consulta extra)
    if (dto.getSuplidorId() != null) {
      InSuplidor suplidor = new InSuplidor();
      suplidor.setId(dto.getSuplidorId());
      e.setSuplidor(suplidor);
    } else {
      e.setSuplidor(null);
    }
    e.setOrdenEntradaId(dto.getOrdenEntradaId());

    // Montos
    e.setTipoPago(dto.getTipoPago());
    e.setConcepto(dto.getConcepto());
    e.setSubTotal(dto.getSubTotal());
    e.setItbis(dto.getItbis());
    e.setDescuento(dto.getDescuento());
    e.setTotal(dto.getTotal());
    e.setPago(dto.getPago());
    e.setMontoAnulado(dto.getMontoAnulado());
    e.setMontoRetencionItbis(dto.getMontoRetencionItbis());

    // Retenciones — proxy por ID
    if (dto.getRetencionIsrId() != null) {
      MgRetencionItbis isr = new MgRetencionItbis();
      isr.setId(dto.getRetencionIsrId());
      e.setRetencionIsr(isr);
    } else {
      e.setRetencionIsr(null);
    }
    e.setMontoRetencionIsr(dto.getMontoRetencionIsr());

    if (dto.getRetencionItbisId() != null) {
      MgRetencionItbis itbisRet = new MgRetencionItbis();
      itbisRet.setId(dto.getRetencionItbisId());
      e.setRetencionItbis(itbisRet);
    } else {
      e.setRetencionItbis(null);
    }
    e.setMontoRetencionItbisPct(dto.getMontoRetencionItbisPct());

    // Tipo factura — proxy por ID
    if (dto.getTipoFacturaId() != null) {
      MgTipoFactura tipo = new MgTipoFactura();
      tipo.setId(dto.getTipoFacturaId());
      e.setTipoFactura(tipo);
    } else {
      e.setTipoFactura(null);
    }
    e.setEsFacturadoElectronicamente(dto.getEsFacturadoElectronicamente());

    // Contabilidad — proxy por ID
    if (dto.getContableId() != null) {
      McCatalogoCuenta contable = new McCatalogoCuenta();
      contable.setId(dto.getContableId());
      e.setContable(contable);
    } else {
      e.setContable(null);
    }
    if (dto.getCxpId() != null) {
      McCatalogoCuenta cxp = new McCatalogoCuenta();
      cxp.setId(dto.getCxpId());
      e.setCxp(cxp);
    } else {
      e.setCxp(null);
    }

    // Mora
    e.setTieneMora(dto.getTieneMora());
    e.setMoraPorciento(dto.getMoraPorciento());
    e.setFechaMora(dto.getFechaMora());
  }

  private void mapDetalles(MfFacturaSuplidorRequestDTO dto, MfFacturaSuplidor header) {
    if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
      return;
    }
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String usuario = tenantContext.getCurrentUsername();

    for (MfFacturaSuplidorDetalleRequestDTO d : dto.getDetalles()) {
      MfFacturaSuplidorDetalle detalle = new MfFacturaSuplidorDetalle();
      detalle.setFacturaSuplidor(header);
      detalle.setCantidad(d.getCantidad());
      detalle.setPrecioUnitario(d.getPrecioUnitario());
      detalle.setMontoItem(d.getMontoItem());
      detalle.setConcepto(d.getConcepto());
      detalle.setSubTotal(d.getSubTotal());
      detalle.setRetencion(d.getRetencion());
      detalle.setRetencionPorciento(d.getRetencionPorciento());
      detalle.setMontoDescuento(d.getMontoDescuento());
      detalle.setMontoRecargo(d.getMontoRecargo());
      detalle.setItbis(d.getItbis());
      detalle.setMontoItbisRetenido(d.getMontoItbisRetenido());
      detalle.setItbisPorciento(d.getItbisPorciento());
      detalle.setTotal(d.getTotal());
      detalle.setIndicadorBienServicio(d.getIndicadorBienServicio());
      detalle.setEstado(d.getEstado());
      detalle.setFormaPagoId(d.getFormaPagoId());
      detalle.setUsuarioReg(usuario);
      detalle.setFechaReg(LocalDateTime.now());
      detalle.setEstado("ACT");

      // ITBIS — proxy por ID
      if (d.getItbisId() != null) {
        MgItbis itbis = new MgItbis();
        itbis.setId(d.getItbisId());
        detalle.setItbisObj(itbis);
      }

      // Descuentos del renglón
      if (d.getDescuentos() != null) {
        for (MfFacturaSuplidorDetalleDescuentoRequestDTO descDto : d.getDescuentos()) {
          MfFacturaSuplidorDetalleDescuento desc = new MfFacturaSuplidorDetalleDescuento();
          desc.setDetalle(detalle);
          desc.setTipo(descDto.getTipo());
          desc.setValor(descDto.getValor());
          desc.setMonto(descDto.getMonto());
          desc.setEmpresaId(empresaId);
          detalle.getDescuentos().add(desc);
        }
      }

      header.getDetalles().add(detalle);
    }
  }
}
