package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InAlmacenRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenSearchCriteria;
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

  // ── helpers ────────────────────────────────────────────────────────────────

  private SgSucursal resolveSucursal(Integer sucursalId) {
    return sucursalRepository
        .findById(sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada: " + sucursalId));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public InAlmacen create(InAlmacenRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    // Sucursal viene del frontend; empresa del TenantContext
    SgSucursal sucursal = resolveSucursal(request.getSucursalId());

    InAlmacen almacen = new InAlmacen();
    almacen.setEmpresaId(empresaId);
    almacen.setSucursalId(sucursal);
    almacen.setUsuarioReg(username);
    almacen.setFechaReg(LocalDateTime.now());
    almacen.setNombre(request.getNombre());
    almacen.setUbicacion(request.getUbicacion());
    almacen.setEstadoId("ACT");

    return inAlmacenDao.save(almacen);
  }

  @Override
  @Transactional
  public InAlmacen update(Integer id, InAlmacenRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    // Buscar por empresa (no por sucursal, puede cambiar de sucursal)
    InAlmacen existing =
        inAlmacenDao
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    SgSucursal sucursal = resolveSucursal(request.getSucursalId());

    existing.setSucursalId(sucursal);
    existing.setNombre(request.getNombre());
    existing.setUbicacion(request.getUbicacion());

    return inAlmacenDao.save(existing);
  }

  @Override
  public InAlmacen getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inAlmacenDao
        .findByIdAndEmpresaId(id, empresaId)
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
        .filter(a -> "ACT".equals(a.getEstadoId()))
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void disable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InAlmacen almacen =
        inAlmacenDao
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
    almacen.setEstadoId("INA");
    inAlmacenDao.save(almacen);
  }

  @Override
  @Transactional
  public void enable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InAlmacen almacen =
        inAlmacenDao
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
    almacen.setEstadoId("ACT");
    inAlmacenDao.save(almacen);
  }

  @Override
  public List<InAlmacenResumenDTO> buscar(InAlmacenSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    List<InAlmacen> lista;
    if (criteria.getSucursalId() != null) {
      lista = inAlmacenDao.findAllByEmpresaIdAndSucursalId(empresaId, criteria.getSucursalId());
    } else {
      lista = inAlmacenDao.findAllByEmpresaId(empresaId);
    }

    return lista.stream()
        .filter(
            a ->
                criteria.getNombre() == null
                    || criteria.getNombre().isBlank()
                    || a.getNombre().toLowerCase().contains(criteria.getNombre().toLowerCase()))
        .filter(
            a ->
                criteria.getEstadoId() == null
                    || criteria.getEstadoId().isBlank()
                    || criteria.getEstadoId().equals(a.getEstadoId()))
        .map(
            a ->
                new InAlmacenResumenDTO(
                    a.getId(),
                    a.getNombre(),
                    a.getUbicacion(),
                    a.getSucursalId() != null ? a.getSucursalId().getId() : null,
                    a.getSucursalId() != null ? a.getSucursalId().getNombre() : null,
                    a.getEstadoId(),
                    a.getUsuarioReg()))
        .collect(Collectors.toList());
  }
}
