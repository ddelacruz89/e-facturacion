package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.models.IProductoVenta;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class FacturacionServices implements IFacturacion {
  private final FacturaDao facturaDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  public List<MfFactura> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return facturaDao.findAllActiveByEmpresaIdAndSucursalId(empresaId, sucursalId);
  }

  @Override
  public List<MfFactura> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return facturaDao.findAllByEmpresaIdAndSucursalId(empresaId, sucursalId);
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
    entity.setFechaReg(LocalDateTime.now());
    entity.setEstadoId("ACT");
    int nextSecuencia =
        secuenciasDao.getNextSecuencia(
            empresaId, MfFactura.class.getSimpleName().toUpperCase(Locale.ROOT));
    String nextSecuenciaEcf =
        secuenciasDao.getNextSecuenciaEcf(empresaId, entity.getTipoComprobanteId());
    entity.setSecuencia(nextSecuencia);
    entity.setNcf(nextSecuenciaEcf);

    entity.getDetalles().forEach(entityDetalle -> entityDetalle.setFacturaId(entity));
    DoubleSummaryStatistics montoDescuento =
        entity.getDetalles().stream()
            .collect(Collectors.summarizingDouble(value -> this.ifNull(value.getMontoDescueto())));
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

    return facturaDao.save(entity);
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
  public List<IProductoVenta> getProductoVenta() {
    return facturaDao.findProductoVenta();
  }
}
