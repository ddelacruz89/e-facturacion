package com.braintech.eFacturador.dto.helpdesk;

import java.time.LocalDateTime;
import java.util.List;

public record HdComentarioDTO(
    Integer id,
    String contenido,
    String autor,
    String origen,
    LocalDateTime fechaReg,
    List<HdAdjuntoDTO> adjuntos) {}
