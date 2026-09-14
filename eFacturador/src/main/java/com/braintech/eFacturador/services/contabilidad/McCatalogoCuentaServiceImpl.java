package com.braintech.eFacturador.services.contabilidad;

import com.braintech.eFacturador.dao.contabilidad.McCatalogoCuentaDao;
import com.braintech.eFacturador.dao.contabilidad.McTipoCuentaDao;
import com.braintech.eFacturador.dto.contabilidad.McCatalogoCuentaNodoDTO;
import com.braintech.eFacturador.dto.contabilidad.McCatalogoCuentaRequestDTO;
import com.braintech.eFacturador.dto.contabilidad.McCatalogoCuentaSugerenciaDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.contabilidad.McCatalogoCuentaService;
import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
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
public class McCatalogoCuentaServiceImpl implements McCatalogoCuentaService {

  private final McCatalogoCuentaDao cuentaDao;
  private final McTipoCuentaDao tipoCuentaDao;
  private final TenantContext tenantContext;

  @Override
  @Transactional(readOnly = true)
  public Page<McCatalogoCuentaNodoDTO> buscarRaices(int page, int size) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Page<McCatalogoCuenta> raices = cuentaDao.findRaices(empresaId, PageRequest.of(page, size));
    Set<Integer> idsConHijos = idsConHijos(empresaId, raices.getContent());
    return raices.map(c -> toNodo(c, idsConHijos));
  }

  @Override
  @Transactional(readOnly = true)
  public List<McCatalogoCuentaNodoDTO> buscarHijos(Integer padreId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    cuentaDao
        .findByIdAndEmpresaId(padreId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Cuenta padre no encontrada"));

    List<McCatalogoCuenta> hijos = cuentaDao.findHijos(empresaId, padreId);
    Set<Integer> idsConHijos = idsConHijos(empresaId, hijos);
    return hijos.stream().map(c -> toNodo(c, idsConHijos)).collect(Collectors.toList());
  }

  /**
   * Sugiere el código de la próxima sub-cuenta bajo {@code padreId}, siguiendo la convención del
   * plan de cuentas: nivel 0 avanza el nivel1 de 10 en 10 (110, 120...), nivel 1 avanza el último
   * dígito del nivel1 de 1 en 1 (111, 112...), nivel 2 avanza nivel2 de 1 en 1 (01, 02...) y nivel
   * 4 (hoja, la única que permite movimiento) avanza nivel4 de 1 en 1 (0001, 0002...).
   */
  @Override
  @Transactional(readOnly = true)
  public McCatalogoCuentaSugerenciaDTO sugerirSubcuenta(Integer padreId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    McCatalogoCuenta padre =
        cuentaDao
            .findByIdAndEmpresaId(padreId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Cuenta padre no encontrada"));

    if (Boolean.TRUE.equals(padre.getPermiteMovimiento())) {
      throw new ApplicationException(
          "Una cuenta de movimiento (nivel 4) no puede tener sub-cuentas.");
    }

    List<McCatalogoCuenta> hijos = cuentaDao.findHijos(empresaId, padreId);
    int targetNivel = siguienteNivel(padre.getNivel());

    String nivel1;
    String nivel2;
    String nivel3;
    String nivel4;

    if (targetNivel == 0) {
      int base = parseIntSafe(padre.getNivel1());
      int max = hijos.stream().mapToInt(h -> parseIntSafe(h.getNivel1())).max().orElse(base);
      nivel1 = pad(Math.max(base, max) + 10, 3);
      nivel2 = "00";
      nivel3 = "0";
      nivel4 = "0000";
    } else if (targetNivel == 1) {
      String prefijo =
          padre.getNivel1() != null && padre.getNivel1().length() >= 2
              ? padre.getNivel1().substring(0, 2)
              : "0";
      int max =
          hijos.stream()
              .map(McCatalogoCuenta::getNivel1)
              .filter(n -> n != null && n.length() == 3)
              .mapToInt(n -> Character.getNumericValue(n.charAt(2)))
              .max()
              .orElse(0);
      nivel1 = prefijo + (max + 1);
      nivel2 = "00";
      nivel3 = "0";
      nivel4 = "0000";
    } else if (targetNivel == 2) {
      int max = hijos.stream().mapToInt(h -> parseIntSafe(h.getNivel2())).max().orElse(0);
      nivel1 = padre.getNivel1();
      nivel2 = pad(max + 1, 2);
      nivel3 = "0";
      nivel4 = "0000";
    } else {
      int max = hijos.stream().mapToInt(h -> parseIntSafe(h.getNivel4())).max().orElse(0);
      nivel1 = padre.getNivel1();
      nivel2 = padre.getNivel2();
      nivel3 = padre.getNivel3() != null ? padre.getNivel3() : "0";
      nivel4 = pad(max + 1, 4);
    }

    String cuenta = nivel1 + "." + nivel2 + "." + nivel3 + "." + nivel4;
    int siguienteOrden =
        hijos.stream().mapToInt(h -> h.getOrden() != null ? h.getOrden() : 0).max().orElse(-1) + 1;

    return new McCatalogoCuentaSugerenciaDTO(
        targetNivel, nivel1, nivel2, nivel3, nivel4, cuenta, siguienteOrden, targetNivel == 4);
  }

  /** nivel 2 y 3 saltan directo a la hoja (nivel 4); solo null/0/1 avanzan de a uno. */
  private int siguienteNivel(Integer nivelPadre) {
    if (nivelPadre == null) return 0;
    if (nivelPadre >= 2) return 4;
    return nivelPadre + 1;
  }

  private static int parseIntSafe(String s) {
    if (s == null || s.isBlank()) return 0;
    try {
      return Integer.parseInt(s.trim());
    } catch (NumberFormatException e) {
      return 0;
    }
  }

  private static String pad(int value, int width) {
    return String.format("%0" + width + "d", value);
  }

  @Override
  @Transactional(readOnly = true)
  public McCatalogoCuenta getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return cuentaDao
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Cuenta no encontrada"));
  }

  @Override
  @Transactional
  public McCatalogoCuenta create(McCatalogoCuentaRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    validarCuentaUnica(empresaId, request.getCuenta(), null);

    McCatalogoCuenta entity = new McCatalogoCuenta();
    entity.setEmpresaId(empresaId);
    entity.setUsuarioReg(username);
    entity.setFechaReg(LocalDateTime.now());
    entity.setEstadoId("ACT");
    aplicarCambios(entity, request, empresaId);

    return cuentaDao.save(entity);
  }

  @Override
  @Transactional
  public McCatalogoCuenta update(Integer id, McCatalogoCuentaRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    McCatalogoCuenta existing =
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
    McCatalogoCuenta c = getById(id);
    c.setEstadoId("INA");
    cuentaDao.save(c);
  }

  @Override
  @Transactional
  public void enable(Integer id) {
    McCatalogoCuenta c = getById(id);
    c.setEstadoId("ACT");
    cuentaDao.save(c);
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private Set<Integer> idsConHijos(Integer empresaId, List<McCatalogoCuenta> nodos) {
    if (nodos.isEmpty()) return Set.of();
    List<Integer> ids = nodos.stream().map(McCatalogoCuenta::getId).collect(Collectors.toList());
    return new HashSet<>(cuentaDao.findPadreIdsConHijos(empresaId, ids));
  }

  private McCatalogoCuentaNodoDTO toNodo(McCatalogoCuenta c, Set<Integer> idsConHijos) {
    return new McCatalogoCuentaNodoDTO(
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

  private void aplicarCambios(
      McCatalogoCuenta entity, McCatalogoCuentaRequestDTO request, Integer empresaId) {
    McTipoCuenta tipoCuenta =
        tipoCuentaDao
            .findById(request.getTipoCuentaId())
            .orElseThrow(() -> new RecordNotFoundException("Tipo de cuenta no encontrado"));
    entity.setTipoCuentaId(tipoCuenta);

    if (request.getCuentaPadreId() != null) {
      McCatalogoCuenta padre =
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
    // Solo el nivel 4 (hoja del árbol) permite movimiento — nunca se confía en el cliente para
    // este campo, se deriva siempre del nivel.
    entity.setPermiteMovimiento(request.getNivel() != null && request.getNivel() == 4);
  }
}
