package com.braintech.eFacturador.dto.helpdesk;

import java.time.LocalDateTime;

public record HdAdjuntoDTO(
    Integer id,
    String nombreArchivo,
    String mimeType,
    Long tamanioBytes,
    String autor,
    LocalDateTime fechaReg) {}
