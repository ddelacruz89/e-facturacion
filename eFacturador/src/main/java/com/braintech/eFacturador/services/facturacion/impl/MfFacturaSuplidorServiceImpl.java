package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorDao;
import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorRepository;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorDetalleDescuentoRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorDetalleRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
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
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MfFacturaSuplidorServiceImpl implements MfFacturaSuplidorService {

  private final MfFacturaSuplidorRepository repository;
  private final MfFacturaSuplidorDao dao;
  private final TenantContext tenantContext;

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

  // ── Save ──────────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public MfFacturaSuplidor save(MfFacturaSuplidorRequestDTO dto) {
    MfFacturaSuplidor entity = new MfFacturaSuplidor();
    mapHeader(dto, entity);
    mapDetalles(dto, entity);
    return repository.save(entity);
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
    e.setEsCredito(dto.getEsCredito());

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
