package com.braintech.eFacturador.controllers.helpdesk;

import com.braintech.eFacturador.dto.helpdesk.*;
import com.braintech.eFacturador.interfaces.helpdesk.HdTicketClienteService;
import com.braintech.eFacturador.jpa.helpdesk.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/helpdesk/tickets")
@AllArgsConstructor
public class HdTicketClienteController {

  private final HdTicketClienteService ticketService;

  @GetMapping
  public Page<HdTicketResumenDTO> listar(
      @RequestParam(defaultValue = "") String q,
      @RequestParam(required = false) String estadoId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {
    return ticketService.listarTickets(q, estadoId, page, size);
  }

  @GetMapping("/{id}")
  public HdTicketDetalleDTO obtener(@PathVariable Integer id) {
    return ticketService.obtenerTicket(id);
  }

  @PostMapping
  public ResponseEntity<HdTicketDetalleDTO> crear(@Valid @RequestBody HdTicketCreateDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.crearTicket(dto));
  }

  @PostMapping("/{id}/comentarios")
  public ResponseEntity<HdComentarioDTO> agregarComentario(
      @PathVariable Integer id, @Valid @RequestBody HdComentarioCreateDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.agregarComentario(id, dto));
  }

  @PostMapping("/{id}/adjuntos")
  public ResponseEntity<HdAdjuntoDTO> subirAdjunto(
      @PathVariable Integer id,
      @RequestParam(required = false) Integer comentarioId,
      @RequestParam MultipartFile file) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ticketService.subirAdjunto(id, comentarioId, file));
  }

  @GetMapping("/adjuntos/{adjuntoId}/descargar")
  public void descargarAdjunto(@PathVariable Integer adjuntoId, HttpServletResponse response) {
    ticketService.descargarAdjunto(adjuntoId, response);
  }

  @GetMapping("/estados")
  public List<HdEstado> estados() {
    return ticketService.listarEstados();
  }

  @GetMapping("/prioridades")
  public List<HdPrioridadClienteDTO> prioridades() {
    return ticketService.listarPrioridades();
  }
}
