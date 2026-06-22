package com.braintech.eFacturador.interfaces.helpdesk;

import com.braintech.eFacturador.dto.helpdesk.*;
import com.braintech.eFacturador.jpa.helpdesk.HdEstado;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface HdTicketClienteService {

  Page<HdTicketResumenDTO> listarTickets(String q, String estadoId, int page, int size);

  HdTicketDetalleDTO obtenerTicket(Integer id);

  HdTicketDetalleDTO crearTicket(HdTicketCreateDTO dto);

  HdComentarioDTO agregarComentario(Integer ticketId, HdComentarioCreateDTO dto);

  HdAdjuntoDTO subirAdjunto(Integer ticketId, Integer comentarioId, MultipartFile file);

  void descargarAdjunto(Integer adjuntoId, HttpServletResponse response);

  List<HdEstado> listarEstados();

  List<HdPrioridadClienteDTO> listarPrioridades();
}
