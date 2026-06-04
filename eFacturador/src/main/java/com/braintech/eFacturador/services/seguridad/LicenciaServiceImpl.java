package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.ModuloDao;
import com.braintech.eFacturador.dao.seguridad.SgLicenciaModuloRepository;
import com.braintech.eFacturador.dao.seguridad.SgLicenciaRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.exceptions.LicenciaExcedidaException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.seguridad.LicenciaService;
import com.braintech.eFacturador.jpa.seguridad.SgLicencia;
import com.braintech.eFacturador.jpa.seguridad.SgLicenciaModulo;
import com.braintech.eFacturador.jpa.seguridad.SgModulo;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LicenciaServiceImpl implements LicenciaService {

  private final SgLicenciaRepository licenciaRepository;
  private final SgLicenciaModuloRepository licenciaModuloRepository;
  private final SgUsuarioRepository usuarioRepository;
  private final SgSucursalRepository sucursalRepository;
  private final ModuloDao moduloRepository;
  private final TenantContext tenantContext;

  @Override
  public List<SgLicencia> getAll() {
    return licenciaRepository.findAll();
  }

  @Override
  public SgLicencia getLicencia(Integer empresaId) {
    return licenciaRepository
        .findByEmpresaId(empresaId)
        .orElseThrow(
            () -> new RecordNotFoundException("No existe licencia para empresa: " + empresaId));
  }

  @Override
  @Transactional
  public SgLicencia save(SgLicencia licencia) {
    if (licencia.getFechaReg() == null) licencia.setFechaReg(LocalDateTime.now());
    if (licencia.getUsuarioReg() == null)
      licencia.setUsuarioReg(tenantContext.getCurrentUsername());
    if (licencia.getActivo() == null) licencia.setActivo(true);
    return licenciaRepository.save(licencia);
  }

  @Override
  @Transactional
  public SgLicencia update(Integer empresaId, SgLicencia licencia) {
    SgLicencia existing = getLicencia(empresaId);
    existing.setMaxUsuarios(licencia.getMaxUsuarios());
    existing.setMaxSucursales(licencia.getMaxSucursales());
    existing.setFechaVencimiento(licencia.getFechaVencimiento());
    existing.setActivo(licencia.getActivo());
    return licenciaRepository.save(existing);
  }

  @Override
  public void validarLimiteUsuarios(Integer empresaId) {
    SgLicencia licencia =
        licenciaRepository
            .findByEmpresaId(empresaId)
            .orElseThrow(
                () ->
                    new LicenciaExcedidaException(
                        "La empresa no tiene una licencia configurada. Contacte al administrador."));

    if (!Boolean.TRUE.equals(licencia.getActivo())) {
      throw new LicenciaExcedidaException("La licencia de esta empresa está inactiva.");
    }

    long actuales = usuarioRepository.countActivosByEmpresaId(empresaId);
    if (actuales >= licencia.getMaxUsuarios()) {
      throw new LicenciaExcedidaException(
          "Límite de usuarios alcanzado ("
              + actuales
              + "/"
              + licencia.getMaxUsuarios()
              + "). Actualice su licencia para agregar más usuarios.");
    }
  }

  @Override
  public void validarLimiteSucursales(Integer empresaId) {
    SgLicencia licencia =
        licenciaRepository
            .findByEmpresaId(empresaId)
            .orElseThrow(
                () ->
                    new LicenciaExcedidaException(
                        "La empresa no tiene una licencia configurada. Contacte al administrador."));

    if (!Boolean.TRUE.equals(licencia.getActivo())) {
      throw new LicenciaExcedidaException("La licencia de esta empresa está inactiva.");
    }

    long actuales = sucursalRepository.countByEmpresaIdAndActivoTrue(empresaId);
    if (actuales >= licencia.getMaxSucursales()) {
      throw new LicenciaExcedidaException(
          "Límite de sucursales alcanzado ("
              + actuales
              + "/"
              + licencia.getMaxSucursales()
              + "). Actualice su licencia para agregar más sucursales.");
    }
  }

  @Override
  public boolean isModuloHabilitado(Integer empresaId, String moduloId) {
    return licenciaModuloRepository.existsByEmpresaIdAndModuloIdAndActivoTrue(empresaId, moduloId);
  }

  @Override
  public List<SgLicenciaModulo> getModulosHabilitados(Integer empresaId) {
    return licenciaModuloRepository.findByEmpresaIdAndActivoTrue(empresaId);
  }

  @Override
  @Transactional
  public SgLicenciaModulo habilitarModulo(Integer empresaId, String moduloId) {
    SgModulo modulo =
        moduloRepository
            .findById(moduloId)
            .orElseThrow(() -> new RecordNotFoundException("Módulo no encontrado: " + moduloId));

    SgLicenciaModulo lm =
        licenciaModuloRepository
            .findByEmpresaIdAndModuloId(empresaId, moduloId)
            .orElse(new SgLicenciaModulo());

    lm.setEmpresaId(empresaId);
    lm.setModulo(modulo);
    lm.setActivo(true);
    if (lm.getFechaReg() == null) lm.setFechaReg(LocalDateTime.now());
    lm.setUsuarioReg(tenantContext.getCurrentUsername());
    return licenciaModuloRepository.save(lm);
  }

  @Override
  @Transactional
  public void deshabilitarModulo(Integer empresaId, String moduloId) {
    SgLicenciaModulo lm =
        licenciaModuloRepository
            .findByEmpresaIdAndModuloId(empresaId, moduloId)
            .orElseThrow(
                () ->
                    new RecordNotFoundException(
                        "El módulo " + moduloId + " no está configurado para esta empresa."));
    lm.setActivo(false);
    licenciaModuloRepository.save(lm);
  }
}
