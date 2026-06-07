package com.braintech.eFacturador.services.notificacion;

import com.braintech.eFacturador.dao.notificacion.SgNotificacionDestinatarioRepository;
import com.braintech.eFacturador.dao.notificacion.SgNotificacionRepository;
import com.braintech.eFacturador.dao.notificacion.SgNotificacionTipoConfigRepository;
import com.braintech.eFacturador.dao.notificacion.SgNotificacionVistoRepository;
import com.braintech.eFacturador.dao.notificacion.SgUsuarioNotifSuscripcionRepository;
import com.braintech.eFacturador.dao.seguridad.SgPermisoRepository;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionDTO;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionTipoConfigDTO;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionTipoConfigPatchDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.notificacion.SgNotificacionService;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacion;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacionDestinatario;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacionTipoConfig;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacionVisto;
import com.braintech.eFacturador.jpa.notificacion.SgUsuarioNotifSuscripcion;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SgNotificacionServiceImpl implements SgNotificacionService {

  @Autowired private SgNotificacionRepository notificacionRepository;
  @Autowired private SgNotificacionVistoRepository vistoRepository;
  @Autowired private SgNotificacionDestinatarioRepository destinatarioRepository;
  @Autowired private SgPermisoRepository permisoRepository;
  @Autowired private SgNotificacionTipoConfigRepository tipoConfigRepository;
  @Autowired private SgUsuarioNotifSuscripcionRepository suscripcionRepository;
  @Autowired private TenantContext tenantContext;

  @Override
  public List<SgNotificacionDTO> findActivas() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    Collection<String> urls = urlsPermitidas(username, empresaId, sucursalId);

    List<SgNotificacion> notifs =
        notificacionRepository.findActivasByTenant(empresaId, sucursalId, urls);
    Set<Integer> vistas = vistoRepository.findNotificacionIdsByUsername(username);

    return notifs.stream().map(n -> toDTO(n, vistas.contains(n.getId()))).toList();
  }

  @Override
  public List<SgNotificacionDTO> findActivasByModulo(String modulo) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    Collection<String> urls = urlsPermitidas(username, empresaId, sucursalId);

    List<SgNotificacion> notifs =
        notificacionRepository.findActivasByModuloAndTenant(empresaId, sucursalId, modulo, urls);
    Set<Integer> vistas = vistoRepository.findNotificacionIdsByUsername(username);

    return notifs.stream().map(n -> toDTO(n, vistas.contains(n.getId()))).toList();
  }

  @Override
  public long contarNoVistas() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    Collection<String> urls = urlsPermitidas(username, empresaId, sucursalId);
    return notificacionRepository.contarNoVistas(empresaId, sucursalId, username, urls);
  }

  /**
   * Retorna las URLs de menú permitidas para el usuario. Si no tiene ningún permiso aún, devuelve
   * un centinela que no matchea nada — así el IN no queda vacío y solo pasan alertas globales
   * (menuUrlOrigen IS NULL).
   */
  private Collection<String> urlsPermitidas(
      String username, Integer empresaId, Integer sucursalId) {
    Set<String> urls = permisoRepository.findMenuUrlsPermitidas(username, empresaId, sucursalId);
    return urls.isEmpty() ? Set.of("__NO_MATCH__") : urls;
  }

  @Override
  @Transactional
  public void marcarVisto(Integer id) {
    String username = tenantContext.getCurrentUsername();
    if (vistoRepository.existsByNotificacionIdAndUsername(id, username)) return;

    SgNotificacion notif =
        notificacionRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Notificación no encontrada: " + id));
    vistoRepository.save(new SgNotificacionVisto(notif, username));
  }

  @Override
  @Transactional
  public void cerrar(Integer id) {
    String username = tenantContext.getCurrentUsername();
    SgNotificacion notif =
        notificacionRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Notificación no encontrada: " + id));
    notif.setEstadoId("CER");
    notif.setFechaCierre(LocalDateTime.now());
    notif.setUsuarioCierre(username);
    notificacionRepository.save(notif);
  }

  @Override
  public List<SgNotificacionDTO> findLoginPendientes() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    // Tipos que llegan a todos (no restringidos)
    Set<String> tiposNoRestringidos = tipoConfigRepository.findTiposNoRestringidos();

    // Tipos restringidos a los que este usuario está suscrito
    Set<String> tiposSuscritos =
        suscripcionRepository.findTipoIdsByEmpresaIdAndUsername(empresaId, username);

    // Si no hay nada que mostrar al usuario, retornar vacío rápido
    if (tiposNoRestringidos.isEmpty() && tiposSuscritos.isEmpty()) return List.of();

    Set<String> suscritos = tiposSuscritos.isEmpty() ? Set.of("__NONE__") : tiposSuscritos;
    Set<String> noRestringidos =
        tiposNoRestringidos.isEmpty() ? Set.of("__NONE__") : tiposNoRestringidos;

    List<SgNotificacion> notifs =
        notificacionRepository.findLoginPendientes(empresaId, username, noRestringidos, suscritos);
    return notifs.stream().map(n -> toDTO(n, false)).toList();
  }

  @Override
  public List<SgNotificacionTipoConfigDTO> getTiposConSuscripcion(String username) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Set<String> suscritos =
        suscripcionRepository.findTipoIdsByEmpresaIdAndUsername(empresaId, username);

    return tipoConfigRepository.findByActivoTrueOrderByModuloAscNombreAsc().stream()
        .map(t -> toTipoDTO(t, suscritos.contains(t.getTipoId())))
        .toList();
  }

  @Override
  @Transactional
  public void saveSuscripciones(String username, Set<String> tipoIds) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    suscripcionRepository.deleteAllByEmpresaIdAndUsername(empresaId, username);
    tipoIds.forEach(
        tipoId -> {
          SgUsuarioNotifSuscripcion s = new SgUsuarioNotifSuscripcion();
          s.setEmpresaId(empresaId);
          s.setUsername(username);
          s.setTipoId(tipoId);
          s.setFechaReg(LocalDateTime.now());
          suscripcionRepository.save(s);
        });
  }

  @Override
  @Transactional
  public SgNotificacionDTO crear(SgNotificacionDTO dto) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    SgNotificacion n = new SgNotificacion();
    n.setEmpresaId(empresaId);
    n.setSucursalId(dto.getSucursalId());
    n.setModulo(dto.getModulo());
    n.setTipo(dto.getTipo());
    n.setTitulo(dto.getTitulo());
    n.setDescripcion(dto.getDescripcion());
    n.setReferenciaKey(dto.getReferenciaTipo() != null ? dto.getReferenciaTipo() : "manual:" + System.currentTimeMillis());
    n.setMenuUrlOrigen(null);
    n.setParaLogin(true);
    n.setRepetirLogin(dto.isRepetirLogin());
    n.setFechaExpiracion(dto.getFechaExpiracion());
    n.setEstadoId("ACT");
    n.setFechaReg(LocalDateTime.now());
    n.setUsuarioReg(username);
    SgNotificacion saved = notificacionRepository.save(n);

    if (dto.getDestinatarios() != null) {
      dto.getDestinatarios().forEach(u ->
          destinatarioRepository.save(new SgNotificacionDestinatario(saved, u)));
    }

    List<String> destinatarios = destinatarioRepository.findByNotificacionId(saved.getId())
        .stream().map(SgNotificacionDestinatario::getUsername).collect(Collectors.toList());
    return toDTO(saved, false, destinatarios);
  }

  @Override
  public List<String> getDestinatarios(Integer notificacionId) {
    return destinatarioRepository.findByNotificacionId(notificacionId)
        .stream().map(SgNotificacionDestinatario::getUsername).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void addDestinatario(Integer notificacionId, String username) {
    if (destinatarioRepository.existsByNotificacionIdAndUsername(notificacionId, username)) return;
    SgNotificacion notif = notificacionRepository.findById(notificacionId)
        .orElseThrow(() -> new RecordNotFoundException("Notificación no encontrada: " + notificacionId));
    destinatarioRepository.save(new SgNotificacionDestinatario(notif, username));
  }

  @Override
  @Transactional
  public void removeDestinatario(Integer notificacionId, String username) {
    destinatarioRepository.deleteByNotificacionIdAndUsername(notificacionId, username);
  }

  private SgNotificacionDTO toDTO(SgNotificacion n, boolean visto) {
    List<String> destinatarios = destinatarioRepository.findByNotificacionId(n.getId())
        .stream().map(SgNotificacionDestinatario::getUsername).collect(Collectors.toList());
    return toDTO(n, visto, destinatarios);
  }

  private SgNotificacionDTO toDTO(SgNotificacion n, boolean visto, List<String> destinatarios) {
    return SgNotificacionDTO.builder()
        .id(n.getId())
        .empresaId(n.getEmpresaId())
        .sucursalId(n.getSucursalId())
        .modulo(n.getModulo())
        .tipo(n.getTipo())
        .titulo(n.getTitulo())
        .descripcion(n.getDescripcion())
        .referenciaId(n.getReferenciaId())
        .referenciaTipo(n.getReferenciaTipo())
        .payload(n.getPayload())
        .estadoId(n.getEstadoId())
        .fechaReg(n.getFechaReg())
        .usuarioReg(n.getUsuarioReg())
        .visto(visto)
        .paraLogin(Boolean.TRUE.equals(n.getParaLogin()))
        .repetirLogin(Boolean.TRUE.equals(n.getRepetirLogin()))
        .fechaExpiracion(n.getFechaExpiracion())
        .destinatarios(destinatarios.isEmpty() ? null : destinatarios)
        .build();
  }

  @Override
  @Transactional
  public void patchTipoConfig(String tipoId, SgNotificacionTipoConfigPatchDTO patch) {
    SgNotificacionTipoConfig tipo =
        tipoConfigRepository
            .findById(tipoId)
            .orElseThrow(
                () -> new RecordNotFoundException("Tipo de notificación no encontrado: " + tipoId));
    if (patch.getParaLogin() != null) tipo.setParaLogin(patch.getParaLogin());
    if (patch.getAccesoRestringido() != null)
      tipo.setAccesoRestringido(patch.getAccesoRestringido());
    if (patch.getActivo() != null) tipo.setActivo(patch.getActivo());
    tipoConfigRepository.save(tipo);
  }

  private SgNotificacionTipoConfigDTO toTipoDTO(SgNotificacionTipoConfig t, boolean suscrito) {
    return new SgNotificacionTipoConfigDTO(
        t.getTipoId(),
        t.getNombre(),
        t.getDescripcion(),
        t.getModulo(),
        Boolean.TRUE.equals(t.getParaLogin()),
        Boolean.TRUE.equals(t.getAccesoRestringido()),
        Boolean.TRUE.equals(t.getActivo()),
        suscrito);
  }
}
