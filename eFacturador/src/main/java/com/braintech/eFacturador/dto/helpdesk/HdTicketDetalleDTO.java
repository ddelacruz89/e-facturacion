package com.braintech.eFacturador.dto.helpdesk;

import java.time.LocalDateTime;
import java.util.List;

public record HdTicketDetalleDTO(
    Integer id,
    String titulo,
    String descripcion,
    String estadoId,
    String estadoNombre,
    String prioridadId,
    String prioridadNombre,
    LocalDateTime fechaReg,
    String usuarioReg,
    LocalDateTime fechaLimite,
    LocalDateTime fechaCierre,
    List<HdComentarioDTO> comentarios,
    List<HdAdjuntoDTO> adjuntos,
    List<HdHistorialDTO> historial,
    List<String> soporteAsignado) {}
