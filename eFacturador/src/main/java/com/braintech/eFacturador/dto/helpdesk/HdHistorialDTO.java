package com.braintech.eFacturador.dto.helpdesk;

import java.time.LocalDateTime;

public record HdHistorialDTO(
    String estadoAnterior,
    String estadoNuevo,
    String observacion,
    LocalDateTime fecha,
    String usuario) {}
