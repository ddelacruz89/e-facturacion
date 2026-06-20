package com.braintech.eFacturador.services.helpdesk;

import com.braintech.eFacturador.dao.helpdesk.*;
import com.braintech.eFacturador.dto.helpdesk.*;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.helpdesk.HdTicketClienteService;
import com.braintech.eFacturador.jpa.helpdesk.*;
import com.braintech.eFacturador.util.TenantContext;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class HdTicketClienteServiceImpl implements HdTicketClienteService {

  private static final String ESTADO_PEND_ASIG = "PEND_ASIG";
  private static final String ORIGEN_CLIENTE = "CLIENTE";

  private final HdTicketRepository ticketRepository;
  private final HdTicketComentarioRepository comentarioRepository;
  private final HdTicketAdjuntoRepository adjuntoRepository;
  private final HdTicketAsignacionRepository asignacionRepository;
  private final HdTicketHistorialRepository historialRepository;
  private final HdEstadoRepository estadoRepository;
  private final HdPrioridadRepository prioridadRepository;
  private final HdStorageService storageService;
  private final TenantContext tenantContext;

  @Override
  public Page<HdTicketResumenDTO> listarTickets(String q, String estadoId, int page, int size) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return ticketRepository
        .buscarPorEmpresa(empresaId, q == null ? "" : q, estadoId, PageRequest.of(page, size))
        .map(this::toResumenDTO);
  }

  @Override
  public HdTicketDetalleDTO obtenerTicket(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    HdTicket ticket =
        ticketRepository
            .findById(id)
            .filter(t -> t.getEmpresaId().equals(empresaId))
            .orElseThrow(() -> new RecordNotFoundException("Ticket no encontrado: " + id));
    return toDetalleDTO(ticket);
  }

  @Override
  @Transactional
  public HdTicketDetalleDTO crearTicket(HdTicketCreateDTO dto) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    HdPrioridad prioridad =
        prioridadRepository
            .findById(dto.prioridadId())
            .orElseThrow(
                () -> new RecordNotFoundException("Prioridad no válida: " + dto.prioridadId()));

    LocalDateTime fechaLimite =
        dto.fechaLimite() != null
            ? dto.fechaLimite()
            : LocalDateTime.now().plusHours(prioridad.getSlaHoras());

    HdTicket ticket = new HdTicket();
    ticket.setEmpresaId(empresaId);
    ticket.setTitulo(dto.titulo());
    ticket.setDescripcion(dto.descripcion());
    ticket.setEstadoId(ESTADO_PEND_ASIG);
    ticket.setPrioridadId(dto.prioridadId());
    ticket.setFechaReg(LocalDateTime.now());
    ticket.setUsuarioReg(username);
    ticket.setFechaLimite(fechaLimite);
    ticket = ticketRepository.save(ticket);

    HdTicketHistorial historial = new HdTicketHistorial();
    historial.setTicketId(ticket.getId());
    historial.setEstadoAnterior(null);
    historial.setEstadoNuevo(ESTADO_PEND_ASIG);
    historial.setObservacion("Ticket creado por el cliente");
    historial.setFecha(LocalDateTime.now());
    historial.setUsuario(username);
    historialRepository.save(historial);

    return toDetalleDTO(ticket);
  }

  @Override
  @Transactional
  public HdComentarioDTO agregarComentario(Integer ticketId, HdComentarioCreateDTO dto) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    ticketRepository
        .findById(ticketId)
        .filter(t -> t.getEmpresaId().equals(empresaId))
        .orElseThrow(() -> new RecordNotFoundException("Ticket no encontrado: " + ticketId));

    HdTicketComentario comentario = new HdTicketComentario();
    comentario.setTicketId(ticketId);
    comentario.setContenido(dto.contenido());
    comentario.setEsInterno(false);
    comentario.setAutor(username);
    comentario.setOrigen(ORIGEN_CLIENTE);
    comentario.setFechaReg(LocalDateTime.now());

    return toComentarioDTO(comentarioRepository.save(comentario));
  }

  @Override
  @Transactional
  public HdAdjuntoDTO subirAdjunto(Integer ticketId, Integer comentarioId, MultipartFile file) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    ticketRepository
        .findById(ticketId)
        .filter(t -> t.getEmpresaId().equals(empresaId))
        .orElseThrow(() -> new RecordNotFoundException("Ticket no encontrado: " + ticketId));

    String key =
        "helpdesk/tickets/%d/%s_%s"
            .formatted(ticketId, UUID.randomUUID(), file.getOriginalFilename());
    String mimeType =
        file.getContentType() != null ? file.getContentType() : "application/octet-stream";

    try {
      storageService.upload(key, file.getInputStream(), mimeType, file.getSize());
    } catch (IOException e) {
      throw new RuntimeException("Error leyendo el archivo", e);
    }

    HdTicketAdjunto adjunto = new HdTicketAdjunto();
    adjunto.setTicketId(ticketId);
    adjunto.setComentarioId(comentarioId);
    adjunto.setNombreArchivo(file.getOriginalFilename());
    adjunto.setRuta(key);
    adjunto.setProveedor(storageService.getProviderName());
    adjunto.setMimeType(mimeType);
    adjunto.setTamanioBytes(file.getSize());
    adjunto.setAutor(username);
    adjunto.setFechaReg(LocalDateTime.now());

    return toAdjuntoDTO(adjuntoRepository.save(adjunto));
  }

  @Override
  public void descargarAdjunto(Integer adjuntoId, HttpServletResponse response) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    HdTicketAdjunto adjunto =
        adjuntoRepository
            .findById(adjuntoId)
            .orElseThrow(() -> new RecordNotFoundException("Adjunto no encontrado: " + adjuntoId));

    // Validar que el adjunto pertenece a un ticket de la empresa del cliente
    ticketRepository
        .findById(adjunto.getTicketId())
        .filter(t -> t.getEmpresaId().equals(empresaId))
        .orElseThrow(() -> new RecordNotFoundException("Acceso no autorizado al adjunto"));

    response.setContentType(adjunto.getMimeType());
    response.setHeader(
        "Content-Disposition", "attachment; filename=\"" + adjunto.getNombreArchivo() + "\"");
    response.setContentLengthLong(adjunto.getTamanioBytes());

    try (var in = storageService.download(adjunto.getRuta());
        var out = response.getOutputStream()) {
      in.transferTo(out);
    } catch (IOException e) {
      throw new RuntimeException("Error descargando adjunto", e);
    }
  }

  @Override
  public List<HdEstado> listarEstados() {
    return estadoRepository.findAllByOrderByOrdenAsc();
  }

  @Override
  public List<HdPrioridad> listarPrioridades() {
    return prioridadRepository.findAllByOrderByOrdenAsc();
  }

  // ── Mappers ──────────────────────────────────────────────────────────────

  private HdTicketResumenDTO toResumenDTO(HdTicket t) {
    var estado = estadoRepository.findById(t.getEstadoId()).orElse(null);
    var prioridad = prioridadRepository.findById(t.getPrioridadId()).orElse(null);
    boolean proximo = t.getFechaLimite().isBefore(LocalDateTime.now().plusHours(24));

    return new HdTicketResumenDTO(
        t.getId(),
        t.getTitulo(),
        t.getEstadoId(),
        estado != null ? estado.getNombre() : null,
        t.getPrioridadId(),
        prioridad != null ? prioridad.getNombre() : null,
        t.getFechaReg(),
        t.getFechaLimite(),
        proximo);
  }

  private HdTicketDetalleDTO toDetalleDTO(HdTicket t) {
    var estado = estadoRepository.findById(t.getEstadoId()).orElse(null);
    var prioridad = prioridadRepository.findById(t.getPrioridadId()).orElse(null);

    List<HdComentarioDTO> comentarios =
        comentarioRepository.findByTicketIdAndEsInternoFalseOrderByFechaRegAsc(t.getId()).stream()
            .map(this::toComentarioDTO)
            .toList();

    List<HdAdjuntoDTO> adjuntos =
        adjuntoRepository.findByTicketIdOrderByFechaRegDesc(t.getId()).stream()
            .map(this::toAdjuntoDTO)
            .toList();

    List<HdHistorialDTO> historial =
        historialRepository.findByTicketIdOrderByFechaAsc(t.getId()).stream()
            .map(this::toHistorialDTO)
            .toList();

    List<String> soporte =
        asignacionRepository.findByTicketIdAndActivoTrue(t.getId()).stream()
            .map(HdTicketAsignacion::getUsernameSoporte)
            .toList();

    return new HdTicketDetalleDTO(
        t.getId(),
        t.getTitulo(),
        t.getDescripcion(),
        t.getEstadoId(),
        estado != null ? estado.getNombre() : null,
        t.getPrioridadId(),
        prioridad != null ? prioridad.getNombre() : null,
        t.getFechaReg(),
        t.getUsuarioReg(),
        t.getFechaLimite(),
        t.getFechaCierre(),
        comentarios,
        adjuntos,
        historial,
        soporte);
  }

  private HdComentarioDTO toComentarioDTO(HdTicketComentario c) {
    List<HdAdjuntoDTO> adjuntos =
        adjuntoRepository.findByComentarioId(c.getId()).stream().map(this::toAdjuntoDTO).toList();
    return new HdComentarioDTO(
        c.getId(), c.getContenido(), c.getAutor(), c.getOrigen(), c.getFechaReg(), adjuntos);
  }

  private HdAdjuntoDTO toAdjuntoDTO(HdTicketAdjunto a) {
    return new HdAdjuntoDTO(
        a.getId(),
        a.getNombreArchivo(),
        a.getMimeType(),
        a.getTamanioBytes(),
        a.getAutor(),
        a.getFechaReg());
  }

  private HdHistorialDTO toHistorialDTO(HdTicketHistorial h) {
    return new HdHistorialDTO(
        h.getEstadoAnterior(),
        h.getEstadoNuevo(),
        h.getObservacion(),
        h.getFecha(),
        h.getUsuario());
  }
}
