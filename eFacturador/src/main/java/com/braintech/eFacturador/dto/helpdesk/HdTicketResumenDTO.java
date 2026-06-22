package com.braintech.eFacturador.dto.helpdesk;

import java.time.LocalDateTime;

public record HdTicketResumenDTO(
    Integer id,
    String titulo,
    String estadoId,
    String estadoNombre,
    String prioridadId,
    String prioridadNombre,
    LocalDateTime fechaReg,
    LocalDateTime fechaLimite,
    boolean proximoAVencer) {}
