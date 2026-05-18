package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorFormaPagoRepository;
import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorPagosDao;
import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorPagosRepository;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosDetalleRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorPagosDetalle;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorPagosHeader;
import com.braintech.eFacturador.services.facturacion.MfFacturaSuplidorPagosService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MfFacturaSuplidorPagosServiceImpl implements MfFacturaSuplidorPagosService {

  private final MfFacturaSuplidorPagosRepository repository;
  private final MfFacturaSuplidorPagosDao dao;
  private final MfFacturaSuplidorFormaPagoRepository formaPagoRepository;
  private final TenantContext tenantContext;

  @Override
  public List<MfFacturaSuplidorPagosHeaderResumenDTO> buscar(
      MfFacturaSuplidorPagosHeaderSearchCriteria criteria) {
    return dao.buscar(tenantContext.getCurrentEmpresaId(), criteria);
  }

  @Override
  public MfFacturaSuplidorPagosHeader findById(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Pago suplidor no encontrado: " + id));
  }

  @Override
  @Transactional
  public MfFacturaSuplidorPagosHeader save(MfFacturaSuplidorPagosHeaderRequestDTO dto) {
    MfFacturaSuplidorPagosHeader header = new MfFacturaSuplidorPagosHeader();
    mapHeader(dto, header);
    mapDetalles(dto, header);
    return repository.save(header);
  }

  @Override
  @Transactional
  public MfFacturaSuplidorPagosHeader update(
      Integer id, MfFacturaSuplidorPagosHeaderRequestDTO dto) {
    MfFacturaSuplidorPagosHeader header = findById(id);
    mapHeader(dto, header);
    header.getDetalles().clear();
    mapDetalles(dto, header);
    return repository.save(header);
  }

  @Override
  @Transactional
  public MfFacturaSuplidorPagosHeader anular(Integer id) {
    MfFacturaSuplidorPagosHeader header = findById(id);
    header.setEstadoId("ANU");
    header.setFechaAnulado(LocalDateTime.now());
    header.setUsuarioAnulacion(tenantContext.getCurrentUsername());
    header.getDetalles().forEach(d -> d.setEstado("ANU"));
    return repository.save(header);
  }

  @Override
  public List<MfFacturaSuplidorFormaPago> findFormasPago() {
    return formaPagoRepository.findByEstadoId("ACT");
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private void mapHeader(
      MfFacturaSuplidorPagosHeaderRequestDTO dto, MfFacturaSuplidorPagosHeader h) {
    String usuario = tenantContext.getCurrentUsername();

    if (h.getFechaPago() == null) {
      h.setFechaPago(dto.getFechaPago() != null ? dto.getFechaPago() : LocalDateTime.now());
    }
    h.setUsuarioReg(usuario);
    h.setMonto(dto.getMonto());
    h.setPagado(dto.getPagado());
    h.setEstadoId(dto.getEstadoId() != null ? dto.getEstadoId() : "ACT");
    h.setContableId(dto.getContableId());

    if (dto.getFacturaSuplidorId() != null) {
      MfFacturaSuplidor factura = new MfFacturaSuplidor();
      factura.setId(dto.getFacturaSuplidorId());
      h.setFacturaSuplidor(factura);
    }
  }

  private void mapDetalles(
      MfFacturaSuplidorPagosHeaderRequestDTO dto, MfFacturaSuplidorPagosHeader header) {
    if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
      return;
    }
    String usuario = tenantContext.getCurrentUsername();
    for (MfFacturaSuplidorPagosDetalleRequestDTO d : dto.getDetalles()) {
      MfFacturaSuplidorPagosDetalle detalle = new MfFacturaSuplidorPagosDetalle();
      detalle.setPagosHeader(header);
      detalle.setNumeroReferencia(d.getNumeroReferencia());
      detalle.setMontoPagado(d.getMontoPagado());
      detalle.setFechaPago(d.getFechaPago() != null ? d.getFechaPago() : LocalDateTime.now());
      detalle.setUsuarioReg(usuario);
      detalle.setConcepto(d.getConcepto());
      detalle.setTipoPago(d.getTipoPago() != null ? d.getTipoPago() : 1);
      detalle.setEstado(d.getEstado() != null ? d.getEstado() : "ACT");

      if (d.getFormaPagoId() != null) {
        MfFacturaSuplidorFormaPago formaPago = new MfFacturaSuplidorFormaPago();
        formaPago.setId(d.getFormaPagoId());
        detalle.setFormaPago(formaPago);
      }

      header.getDetalles().add(detalle);
    }
  }
}
