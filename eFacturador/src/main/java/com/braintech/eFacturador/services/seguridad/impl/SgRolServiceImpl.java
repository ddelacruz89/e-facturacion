package com.braintech.eFacturador.services.seguridad.impl;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.seguridad.SgPermisoRepository;
import com.braintech.eFacturador.dao.seguridad.SgRolRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRolRepository;
import com.braintech.eFacturador.dto.seguridad.SgRolResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgRolSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.seguridad.SgPermiso;
import com.braintech.eFacturador.jpa.seguridad.SgRol;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.jpa.seguridad.SgUsuarioRol;
import com.braintech.eFacturador.services.seguridad.SgRolService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class SgRolServiceImpl implements SgRolService {

  private final SgRolRepository rolRepository;
  private final SgPermisoRepository permisoRepository;
  private final SgUsuarioRolRepository usuarioRolRepository;
  private final SgUsuarioRepository usuarioRepository;
  private final SgSucursalRepository sucursalRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;

  @Override
  public List<SgRolResumenDTO> buscar(SgRolSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    LocalDate inicio =
        criteria.getFechaInicio() != null
            ? criteria.getFechaInicio()
            : LocalDate.now().minusDays(30);
    LocalDate fin = criteria.getFechaFin() != null ? criteria.getFechaFin() : LocalDate.now();

    LocalDateTime desde = inicio.atStartOfDay();
    LocalDateTime hasta = fin.atTime(LocalTime.MAX);

    String nombre =
        (criteria.getNombre() != null && !criteria.getNombre().isBlank())
            ? criteria.getNombre().trim()
            : null;

    return rolRepository.buscar(empresaId, desde, hasta, nombre);
  }

  @Override
  public SgRol getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return rolRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Rol no encontrado"));
  }

  @Override
  @Transactional
  public SgRol save(SgRol rol) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();
    boolean isUpdate = rol.getId() != null && rol.getId() > 0;

    if (isUpdate) {
      SgRol existing =
          rolRepository
              .findByIdAndEmpresaId(rol.getId(), empresaId)
              .orElseThrow(() -> new RecordNotFoundException("Rol no encontrado"));
      rol.setEmpresaId(existing.getEmpresaId());
      rol.setUsuarioReg(existing.getUsuarioReg());
      rol.setFechaReg(existing.getFechaReg());
      rol.setSecuencia(existing.getSecuencia());
    } else {
      rol.setEmpresaId(empresaId);
      rol.setUsuarioReg(username);
      rol.setFechaReg(LocalDateTime.now());
      if (rol.getActivo() == null) rol.setActivo(true);
    }

    // Corregir back-references y auditoría de cada permiso
    if (rol.getPermisos() != null) {
      for (SgPermiso permiso : rol.getPermisos()) {
        permiso.setRol(rol);
        if (permiso.getId() == null || permiso.getId() == 0) {
          // Upsert: si ya existe un permiso para este rol+menu+empresa, reutilizar su ID
          // y preservar los campos de auditoría del registro existente
          Integer menuId = permiso.getMenu() != null ? permiso.getMenu().getId() : null;
          if (menuId != null) {
            permisoRepository
                .findByRolIdAndMenuIdAndEmpresaId(rol.getId(), menuId, empresaId)
                .ifPresent(
                    existing -> {
                      permiso.setId(existing.getId());
                      permiso.setEmpresaId(existing.getEmpresaId());
                      permiso.setUsuarioReg(existing.getUsuarioReg());
                      permiso.setFechaReg(existing.getFechaReg());
                      if (permiso.getActivo() == null) permiso.setActivo(existing.getActivo());
                    });
          }
          // Solo para permisos verdaderamente nuevos (no encontrados en BD)
          if (permiso.getId() == null || permiso.getId() == 0) {
            permiso.setEmpresaId(empresaId);
            permiso.setUsuarioReg(username);
            permiso.setFechaReg(LocalDateTime.now());
            if (permiso.getActivo() == null) permiso.setActivo(true);
          }
        }
        // Garantizar defaults en flags
        if (permiso.getPuedeLeer() == null) permiso.setPuedeLeer(false);
        if (permiso.getPuedeEscribir() == null) permiso.setPuedeEscribir(false);
        if (permiso.getPuedeEliminar() == null) permiso.setPuedeEliminar(false);
        if (permiso.getPuedeImprimir() == null) permiso.setPuedeImprimir(false);
      }
    }

    SgRol saved = rolRepository.save(rol);

    // Generar secuencia en creación nueva
    if (!isUpdate && (saved.getSecuencia() == null || saved.getSecuencia() == 0)) {
      int seq =
          secuenciasDao.getNextSecuencia(
              empresaId, SgRol.class.getSimpleName().toUpperCase(Locale.ROOT));
      saved.setSecuencia(seq);
      rolRepository.save(saved);
    }

    return saved;
  }

  @Override
  public List<SgUsuarioRol> getUsuariosRol(Integer rolId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return usuarioRolRepository.findByRolAndSucursal(rolId, empresaId, sucursalId);
  }

  @Override
  @Transactional
  public SgUsuarioRol addUsuarioRol(Integer rolId, String username, Integer sucursalId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    // Si el frontend no envía sucursalId, se usa la sucursal del token
    if (sucursalId == null) {
      sucursalId = tenantContext.getCurrentSucursalId();
    }
    String currentUser = tenantContext.getCurrentUsername();

    SgRol rol =
        rolRepository
            .findByIdAndEmpresaId(rolId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Rol no encontrado"));
    SgUsuario usuario =
        usuarioRepository
            .findById(username)
            .orElseThrow(() -> new RecordNotFoundException("Usuario no encontrado"));
    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    SgUsuarioRol asignacion = new SgUsuarioRol();
    asignacion.setEmpresaId(empresaId);
    asignacion.setUsuarioReg(currentUser);
    asignacion.setFechaReg(LocalDateTime.now());
    asignacion.setActivo(true);
    asignacion.setRol(rol);
    asignacion.setUsuario(usuario);
    asignacion.setSucursalId(sucursal);

    return usuarioRolRepository.save(asignacion);
  }

  @Override
  @Transactional
  public void removeUsuarioRol(Integer asignacionId) {
    usuarioRolRepository.deleteById(asignacionId);
  }
}
