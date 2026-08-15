package com.braintech.eFacturador.services.contabilidad;

import com.braintech.eFacturador.dao.contabilidad.McCuentaDao;
import com.braintech.eFacturador.dao.contabilidad.McTipoCuentaDao;
import com.braintech.eFacturador.dto.contabilidad.McCuentaNodoDTO;
import com.braintech.eFacturador.dto.contabilidad.McCuentaRequestDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.contabilidad.McCuentaService;
import com.braintech.eFacturador.jpa.contabilidad.McCuenta;
import com.braintech.eFacturador.jpa.contabilidad.McTipoCuenta;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class McCuentaServiceImpl implements McCuentaService {

  private final McCuentaDao cuentaDao;
  private final McTipoCuentaDao tipoCuentaDao;
  private final TenantContext tenantContext;

  @Override
  @Transactional(readOnly = true)
  public Page<McCuentaNodoDTO> buscarRaices(int page, int size) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Page<McCuenta> raices = cuentaDao.findRaices(empresaId, PageRequest.of(page, size));
    Set<Integer> idsConHijos = idsConHijos(empresaId, raices.getContent());
    return raices.map(c -> toNodo(c, idsConHijos));
  }

  @Override
  @Transactional(readOnly = true)
  public List<McCuentaNodoDTO> buscarHijos(Integer padreId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    cuentaDao
        .findByIdAndEmpresaId(padreId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Cuenta padre no encontrada"));

    List<McCuenta> hijos = cuentaDao.findHijos(empresaId, padreId);
    Set<Integer> idsConHijos = idsConHijos(empresaId, hijos);
    return hijos.stream().map(c -> toNodo(c, idsConHijos)).collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public McCuenta getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return cuentaDao
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Cuenta no encontrada"));
  }

  @Override
  @Transactional
  public McCuenta create(McCuentaRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    validarCuentaUnica(empresaId, request.getCuenta(), null);

    McCuenta entity = new McCuenta();
    entity.setEmpresaId(empresaId);
    entity.setUsuarioReg(username);
    entity.setFechaReg(LocalDateTime.now());
    entity.setEstadoId("ACT");
    aplicarCambios(entity, request, empresaId);

    return cuentaDao.save(entity);
  }

  @Override
  @Transactional
  public McCuenta update(Integer id, McCuentaRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    McCuenta existing =
        cuentaDao
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Cuenta no encontrada"));

    validarCuentaUnica(empresaId, request.getCuenta(), id);
    aplicarCambios(existing, request, empresaId);

    return cuentaDao.save(existing);
  }

  @Override
  @Transactional
  public void disable(Integer id) {
    McCuenta c = getById(id);
    c.setEstadoId("INA");
    cuentaDao.save(c);
  }

  @Override
  @Transactional
  public void enable(Integer id) {
    McCuenta c = getById(id);
    c.setEstadoId("ACT");
    cuentaDao.save(c);
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private Set<Integer> idsConHijos(Integer empresaId, List<McCuenta> nodos) {
    if (nodos.isEmpty()) return Set.of();
    List<Integer> ids = nodos.stream().map(McCuenta::getId).collect(Collectors.toList());
    return new HashSet<>(cuentaDao.findPadreIdsConHijos(empresaId, ids));
  }

  private McCuentaNodoDTO toNodo(McCuenta c, Set<Integer> idsConHijos) {
    return new McCuentaNodoDTO(
        c.getId(),
        c.getCuentaPadreId() != null ? c.getCuentaPadreId().getId() : null,
        c.getCuenta(),
        c.getNombreCuenta(),
        c.getNivel(),
        c.getPermiteMovimiento(),
        c.getSaldoCuenta(),
        c.getEstadoId(),
        c.getTipoCuentaId() != null ? c.getTipoCuentaId().getId() : null,
        c.getTipoCuentaId() != null ? c.getTipoCuentaId().getTipoCuenta() : null,
        idsConHijos.contains(c.getId()));
  }

  private void validarCuentaUnica(Integer empresaId, String cuenta, Integer idExcluido) {
    boolean duplicada =
        idExcluido == null
            ? cuentaDao.existsByEmpresaIdAndCuenta(empresaId, cuenta)
            : cuentaDao.existsByEmpresaIdAndCuentaAndIdNot(empresaId, cuenta, idExcluido);
    if (duplicada) {
      throw new ApplicationException("Ya existe una cuenta con el código " + cuenta);
    }
  }

  private void aplicarCambios(McCuenta entity, McCuentaRequestDTO request, Integer empresaId) {
    McTipoCuenta tipoCuenta =
        tipoCuentaDao
            .findById(request.getTipoCuentaId())
            .orElseThrow(() -> new RecordNotFoundException("Tipo de cuenta no encontrado"));
    entity.setTipoCuentaId(tipoCuenta);

    if (request.getCuentaPadreId() != null) {
      McCuenta padre =
          cuentaDao
              .findByIdAndEmpresaId(request.getCuentaPadreId(), empresaId)
              .orElseThrow(() -> new RecordNotFoundException("Cuenta padre no encontrada"));
      entity.setCuentaPadreId(padre);
    } else {
      entity.setCuentaPadreId(null);
    }

    entity.setNivel1(request.getNivel1());
    entity.setNivel2(request.getNivel2());
    entity.setNivel3(request.getNivel3());
    entity.setNivel4(request.getNivel4());
    entity.setNivel(request.getNivel());
    entity.setOrden(request.getOrden());
    entity.setCuenta(request.getCuenta());
    entity.setNombreCuenta(request.getNombreCuenta());
    entity.setPermiteMovimiento(
        request.getPermiteMovimiento() != null ? request.getPermiteMovimiento() : true);
  }
}
