package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.dto.seguridad.AdminResetPasswordResponse;
import com.braintech.eFacturador.dto.seguridad.SgUsuarioResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgUsuarioSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.seguridad.LicenciaService;
import com.braintech.eFacturador.interfaces.seguridad.SgUsuarioService;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.util.TenantContext;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SgUsuarioServiceImpl implements SgUsuarioService {

  @Autowired private SgUsuarioRepository usuarioRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private TenantContext tenantContext;
  @Autowired private LicenciaService licenciaService;

  @Override
  public List<SgUsuarioResumenDTO> buscar(SgUsuarioSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    LocalDate inicio =
        criteria.getFechaInicio() != null
            ? criteria.getFechaInicio()
            : LocalDate.now().minusDays(365);
    LocalDate fin = criteria.getFechaFin() != null ? criteria.getFechaFin() : LocalDate.now();

    LocalDateTime desde = inicio.atStartOfDay();
    LocalDateTime hasta = fin.atTime(LocalTime.MAX);

    String q =
        (criteria.getQ() != null && !criteria.getQ().isBlank()) ? criteria.getQ().trim() : null;

    return usuarioRepository.buscar(empresaId, desde, hasta, q);
  }

  @Override
  public SgUsuario getById(String username) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return usuarioRepository
        .findByIdAndEmpresaId(username, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Usuario no encontrado: " + username));
  }

  @Override
  public SgUsuario save(SgUsuario usuario) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    licenciaService.validarLimiteUsuarios(empresaId);
    usuario.setEmpresaId(empresaId);
    if (usuario.getFechaReg() == null) {
      usuario.setFechaReg(LocalDateTime.now());
    }
    if (usuario.getUsuarioReg() == null) {
      usuario.setUsuarioReg(tenantContext.getCurrentUsername());
    }
    if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
      usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
    }
    // Resolver manager: si viene con username, cargar la entidad completa del mismo tenant
    usuario.setManager(resolverManager(usuario.getManager(), empresaId));
    return usuarioRepository.save(usuario);
  }

  @Override
  public SgUsuario update(String username, SgUsuario usuario) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    SgUsuario existing =
        usuarioRepository
            .findByIdAndEmpresaId(username, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Usuario no encontrado: " + username));

    existing.setNombre(usuario.getNombre());
    existing.setLoginEmail(usuario.getLoginEmail());
    existing.setCambioPassword(usuario.getCambioPassword());
    if (usuario.getEstadoId() != null) existing.setEstadoId(usuario.getEstadoId());

    // Solo re-hashear si envían un nuevo password
    if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
      existing.setPassword(passwordEncoder.encode(usuario.getPassword()));
    }

    // Actualizar manager: null limpia el campo, objeto con username lo asigna
    existing.setManager(resolverManager(usuario.getManager(), empresaId));

    return usuarioRepository.save(existing);
  }

  @Override
  public AdminResetPasswordResponse resetearPassword(String username) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    SgUsuario usuario =
        usuarioRepository
            .findByIdAndEmpresaId(username, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Usuario no encontrado: " + username));

    String passwordTemporal = generarPasswordTemporal();
    usuario.setPassword(passwordEncoder.encode(passwordTemporal));
    usuario.setCambioPassword(true);
    usuarioRepository.save(usuario);

    return new AdminResetPasswordResponse(passwordTemporal);
  }

  private static final String CHARS =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

  private String generarPasswordTemporal() {
    SecureRandom random = new SecureRandom();
    StringBuilder sb = new StringBuilder(10);
    for (int i = 0; i < 10; i++) {
      sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
    }
    return sb.toString();
  }

  /**
   * Dado un SgUsuario parcial (solo con username) recibido del frontend, carga la entidad completa
   * del mismo tenant. Devuelve null si no hay manager.
   */
  private SgUsuario resolverManager(SgUsuario managerParcial, Integer empresaId) {
    if (managerParcial == null
        || managerParcial.getUsername() == null
        || managerParcial.getUsername().isBlank()) {
      return null;
    }
    return usuarioRepository
        .findByIdAndEmpresaId(managerParcial.getUsername(), empresaId)
        .orElseThrow(
            () ->
                new RecordNotFoundException(
                    "Manager no encontrado: " + managerParcial.getUsername()));
  }
}
