package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgAprobacionRepository;
import com.braintech.eFacturador.dao.seguridad.SgConfigAprobacionRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.dto.seguridad.SgAprobacionResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgAprobacionSearchCriteria;
import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionSearchCriteria;
import com.braintech.eFacturador.exceptions.AccesoDenegadoException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.seguridad.SgAprobacionService;
import com.braintech.eFacturador.jpa.seguridad.SgAprobacion;
import com.braintech.eFacturador.jpa.seguridad.SgAprobacionDetalle;
import com.braintech.eFacturador.jpa.seguridad.SgConfigAprobacion;
import com.braintech.eFacturador.jpa.seguridad.SgConfigAprobacionNivel;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class SgAprobacionServiceImpl implements SgAprobacionService {

  private final SgAprobacionRepository aprobacionRepo;
  private final SgConfigAprobacionRepository configRepo;
  private final SgUsuarioRepository usuarioRepo;
  private final SgSucursalRepository sucursalRepo;
  private final TenantContext tenantContext;

  // ── Configuración ─────────────────────────────────────────────────────────

  @Override
  public List<SgConfigAprobacionResumenDTO> buscarConfig(
      SgConfigAprobacionSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    LocalDate inicio =
        criteria.getFechaInicio() != null
            ? criteria.getFechaInicio()
            : LocalDate.now().minusYears(1);
    LocalDate fin = criteria.getFechaFin() != null ? criteria.getFechaFin() : LocalDate.now();
    return configRepo.buscar(
        empresaId,
        inicio.atStartOfDay(),
        fin.atTime(LocalTime.MAX),
        criteria.getTipoDocumento(),
        criteria.getActivo());
  }

  @Override
  public SgConfigAprobacion getConfigById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return configRepo
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Configuración no encontrada: " + id));
  }

  @Override
  @Transactional
  public SgConfigAprobacion saveConfig(SgConfigAprobacion config) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    config.setEmpresaId(empresaId);
    config.setFechaReg(LocalDateTime.now());
    config.setUsuarioReg(tenantContext.getCurrentUsername());
    if (config.getActivo() == null) config.setActivo(true);

    // Fijar back-references y auditoría en cada nivel
    for (SgConfigAprobacionNivel nivel : config.getNiveles()) {
      nivel.setConfig(config);
      nivel.setEmpresaId(empresaId);
      nivel.setFechaReg(LocalDateTime.now());
      nivel.setUsuarioReg(tenantContext.getCurrentUsername());
      // Resolver aprobador si viene con solo username
      if (nivel.getAprobador() != null && nivel.getAprobador().getUsername() != null) {
        SgUsuario aprobador =
            usuarioRepo
                .findByIdAndEmpresaId(nivel.getAprobador().getUsername(), empresaId)
                .orElseThrow(
                    () ->
                        new RecordNotFoundException(
                            "Aprobador no encontrado: " + nivel.getAprobador().getUsername()));
        nivel.setAprobador(aprobador);
      }
    }
    return configRepo.save(config);
  }

  @Override
  @Transactional
  public SgConfigAprobacion updateConfig(Integer id, SgConfigAprobacion config) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    SgConfigAprobacion existing =
        configRepo
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Configuración no encontrada: " + id));

    existing.setNombre(config.getNombre());
    existing.setTipoDocumento(config.getTipoDocumento());
    existing.setModoAprobacion(config.getModoAprobacion());
    if (config.getActivo() != null) existing.setActivo(config.getActivo());

    // Reemplazar niveles completos (orphanRemoval=true los limpia)
    existing.getNiveles().clear();
    for (SgConfigAprobacionNivel nivel : config.getNiveles()) {
      nivel.setConfig(existing);
      nivel.setEmpresaId(empresaId);
      nivel.setFechaReg(LocalDateTime.now());
      nivel.setUsuarioReg(tenantContext.getCurrentUsername());
      if (nivel.getAprobador() != null && nivel.getAprobador().getUsername() != null) {
        SgUsuario aprobador =
            usuarioRepo
                .findByIdAndEmpresaId(nivel.getAprobador().getUsername(), empresaId)
                .orElseThrow(
                    () ->
                        new RecordNotFoundException(
                            "Aprobador no encontrado: " + nivel.getAprobador().getUsername()));
        nivel.setAprobador(aprobador);
      }
      existing.getNiveles().add(nivel);
    }
    return configRepo.save(existing);
  }

  @Override
  @Transactional
  public void desactivarConfig(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    SgConfigAprobacion config =
        configRepo
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Configuración no encontrada: " + id));
    config.setActivo(false);
    configRepo.save(config);
  }

  // ── Runtime ───────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public SgAprobacion crearSolicitud(
      String tipoDocumento, Integer documentoId, String solicitanteUsername) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalIdInt = tenantContext.getCurrentSucursalId();

    SgConfigAprobacion config =
        configRepo
            .findActivaByTipoYEmpresa(tipoDocumento, empresaId)
            .orElseThrow(
                () ->
                    new RecordNotFoundException(
                        "No hay configuración de aprobación activa para: " + tipoDocumento));

    SgUsuario solicitante =
        usuarioRepo
            .findByIdAndEmpresaId(solicitanteUsername, empresaId)
            .orElseThrow(
                () ->
                    new RecordNotFoundException(
                        "Solicitante no encontrado: " + solicitanteUsername));

    SgSucursal sucursal =
        sucursalRepo
            .findById(sucursalIdInt)
            .orElseThrow(
                () -> new RecordNotFoundException("Sucursal no encontrada: " + sucursalIdInt));

    SgAprobacion aprobacion = new SgAprobacion();
    aprobacion.setEmpresaId(empresaId);
    aprobacion.setSucursalId(sucursal);
    aprobacion.setTipoDocumento(tipoDocumento);
    aprobacion.setDocumentoId(documentoId);
    aprobacion.setConfig(config);
    aprobacion.setSolicitante(solicitante);
    aprobacion.setModoAprobacion(config.getModoAprobacion());
    aprobacion.setEstadoId("PEN");
    aprobacion.setFechaSolicitud(LocalDateTime.now());
    aprobacion.setFechaReg(LocalDateTime.now());
    aprobacion.setUsuarioReg(solicitanteUsername);

    // Construir detalle por cada nivel de la configuración
    for (SgConfigAprobacionNivel nivelConfig : config.getNiveles()) {
      SgUsuario aprobador;
      boolean esManager = false;

      if (Boolean.TRUE.equals(nivelConfig.getUsaManager())) {
        aprobador = solicitante.getManager();
        if (aprobador == null)
          throw new IllegalStateException(
              "El solicitante " + solicitanteUsername + " no tiene manager asignado.");
        esManager = true;
      } else {
        aprobador = nivelConfig.getAprobador();
      }

      SgAprobacionDetalle det = new SgAprobacionDetalle();
      det.setAprobacion(aprobacion);
      det.setEmpresaId(empresaId);
      det.setNivel(nivelConfig.getNivel());
      det.setAprobador(aprobador);
      det.setEsManager(esManager);
      det.setEstadoId("PEN");
      det.setFechaReg(LocalDateTime.now());
      det.setUsuarioReg(solicitanteUsername);
      aprobacion.getDetalle().add(det);
    }

    return aprobacionRepo.save(aprobacion);
  }

  @Override
  @Transactional
  public SgAprobacion responder(Integer aprobacionId, String decision, String comentario) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String aprobadorUsername = tenantContext.getCurrentUsername();

    SgAprobacion aprobacion =
        aprobacionRepo
            .findByIdAndEmpresaId(aprobacionId, empresaId)
            .orElseThrow(
                () -> new RecordNotFoundException("Aprobación no encontrada: " + aprobacionId));

    if (!"PEN".equals(aprobacion.getEstadoId()))
      throw new IllegalStateException(
          "Esta solicitud ya fue resuelta: " + aprobacion.getEstadoId());

    // Buscar el detalle pendiente asignado al aprobador actual
    SgAprobacionDetalle miDetalle =
        aprobacion.getDetalle().stream()
            .filter(
                d ->
                    aprobadorUsername.equals(d.getAprobador().getUsername())
                        && "PEN".equals(d.getEstadoId()))
            .findFirst()
            .orElseThrow(
                () ->
                    new AccesoDenegadoException(
                        "No tienes una aprobación pendiente en esta solicitud."));

    // En modo SECUENCIAL: validar que sea el turno del aprobador actual
    if ("SECUENCIAL".equals(aprobacion.getModoAprobacion())) {
      int nivelMinPendiente =
          aprobacion.getDetalle().stream()
              .filter(d -> "PEN".equals(d.getEstadoId()))
              .mapToInt(SgAprobacionDetalle::getNivel)
              .min()
              .orElse(Integer.MAX_VALUE);
      if (miDetalle.getNivel() != nivelMinPendiente)
        throw new IllegalStateException(
            "Debes esperar tu turno. Nivel activo: "
                + nivelMinPendiente
                + ", tu nivel: "
                + miDetalle.getNivel());
    }

    // Registrar respuesta
    miDetalle.setEstadoId(decision);
    miDetalle.setComentario(comentario);
    miDetalle.setFechaRespuesta(LocalDateTime.now());

    // Evaluar estado global
    evaluarEstadoGlobal(aprobacion);

    return aprobacionRepo.save(aprobacion);
  }

  @Override
  public SgAprobacion getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return aprobacionRepo
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Aprobación no encontrada: " + id));
  }

  @Override
  public List<SgAprobacionResumenDTO> buscar(SgAprobacionSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    LocalDate inicio =
        criteria.getFechaInicio() != null
            ? criteria.getFechaInicio()
            : LocalDate.now().minusDays(30);
    LocalDate fin = criteria.getFechaFin() != null ? criteria.getFechaFin() : LocalDate.now();

    String aprobador =
        Boolean.TRUE.equals(criteria.getSoloMisPendientes())
            ? tenantContext.getCurrentUsername()
            : null;

    return aprobacionRepo.buscar(
        empresaId,
        inicio.atStartOfDay(),
        fin.atTime(LocalTime.MAX),
        criteria.getTipoDocumento(),
        criteria.getEstadoId(),
        criteria.getSolicitante(),
        aprobador);
  }

  @Override
  public List<SgAprobacionResumenDTO> getMisPendientes() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();
    return aprobacionRepo.buscar(
        empresaId,
        LocalDate.now().minusYears(1).atStartOfDay(),
        LocalDate.now().atTime(LocalTime.MAX),
        null,
        "PEN",
        null,
        username);
  }

  @Override
  public boolean existeConfigActiva(String tipoDocumento) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return configRepo.findActivaByTipoYEmpresa(tipoDocumento, empresaId).isPresent();
  }

  // ── Privado ───────────────────────────────────────────────────────────────

  private void evaluarEstadoGlobal(SgAprobacion aprobacion) {
    List<SgAprobacionDetalle> detalles = aprobacion.getDetalle();
    long aprobados = detalles.stream().filter(d -> "APR".equals(d.getEstadoId())).count();
    long rechazados = detalles.stream().filter(d -> "REC".equals(d.getEstadoId())).count();
    long total = detalles.size();

    switch (aprobacion.getModoAprobacion()) {
      case "SECUENCIAL", "SIN_ORDEN" -> {
        if (rechazados > 0) aprobacion.setEstadoId("REC");
        else if (aprobados == total) aprobacion.setEstadoId("APR");
      }
      case "AL_MENOS_UNO" -> {
        if (aprobados > 0) aprobacion.setEstadoId("APR");
        else if (rechazados == total) aprobacion.setEstadoId("REC");
      }
      default -> {
        /* no cambia */
      }
    }

    if (!"PEN".equals(aprobacion.getEstadoId())) aprobacion.setFechaResolucion(LocalDateTime.now());
  }
}
