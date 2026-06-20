package com.braintech.eFacturador.dto.helpdesk;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record HdTicketCreateDTO(
    @NotBlank(message = "titulo es obligatorio") @Size(max = 200) String titulo,
    @NotBlank(message = "descripcion es obligatoria") String descripcion,
    @NotBlank(message = "prioridad_id es obligatorio") String prioridadId,
    LocalDateTime fechaLimite) {}
