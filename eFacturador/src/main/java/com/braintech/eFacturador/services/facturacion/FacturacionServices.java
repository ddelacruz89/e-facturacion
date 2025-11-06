package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class FacturacionServices implements IFacturacion {
  private final FacturaDao facturaDao;
  private final TenantContext tenantContext;

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
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    entity.setEmpresaId(empresaId);
    SgSucursal sucursal = new SgSucursal();
    sucursal.setId(sucursalId);
    entity.setSucursalId(sucursal);
    entity.setUsuarioReg(username);
    entity.setFechaReg(LocalDateTime.now());
    entity.setEstadoId("ACT");

    return facturaDao.save(entity);
  }

  @Override
  @Transactional
  public MfFactura update(Integer id, MfFactura entity) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    MfFactura existing =
        facturaDao
            .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Update fields - keep audit fields from existing
    entity.setId(id);
    entity.setEmpresaId(empresaId);
    SgSucursal sucursal = new SgSucursal();
    sucursal.setId(sucursalId);
    entity.setSucursalId(sucursal);
    entity.setUsuarioReg(existing.getUsuarioReg());
    entity.setFechaReg(existing.getFechaReg());

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
}
