package com.braintech.eFacturador.dto.helpdesk;

import jakarta.validation.constraints.NotBlank;

public record HdComentarioCreateDTO(
    @NotBlank(message = "contenido es obligatorio") String contenido) {}
