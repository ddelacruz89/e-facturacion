package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InAlmacenService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InAlmacenServiceImpl implements InAlmacenService {
  @Autowired private InAlmacenDao inAlmacenDao;

  @Autowired private TenantContext tenantContext;

  @Autowired private SgSucursalRepository sucursalRepository;

  @Override
  @Transactional
  public InAlmacen create(InAlmacen almacen) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    almacen.setEmpresaId(empresaId);
    almacen.setSucursalId(sucursal);
    almacen.setUsuarioReg(username);
    almacen.setFechaReg(LocalDateTime.now());
    almacen.setEstadoId("ACT");

    return inAlmacenDao.save(almacen);
  }

  @Override
  @Transactional
  public InAlmacen update(Integer id, InAlmacen almacen) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    InAlmacen existing =
        inAlmacenDao
            .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    almacen.setId(id);
    almacen.setEmpresaId(empresaId);
    almacen.setSucursalId(existing.getSucursalId());

    return inAlmacenDao.save(almacen);
  }

  @Override
  public InAlmacen getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    return inAlmacenDao
        .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  public List<InAlmacen> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return inAlmacenDao.findAllByEmpresaIdAndSucursalId(empresaId, sucursalId);
  }

  @Override
  public List<InAlmacen> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return inAlmacenDao.findAllByEmpresaIdAndSucursalId(empresaId, sucursalId).stream()
        .filter(almacen -> "ACT".equals(almacen.getEstadoId()))
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void disable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    InAlmacen almacen =
        inAlmacenDao
            .findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    almacen.setEstadoId("INA");
    inAlmacenDao.save(almacen);
  }
}
