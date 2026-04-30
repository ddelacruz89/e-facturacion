package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Builder;

@Builder
public record ValidationResponse(
    String trackId,
    String codigo,
    String estado,
    String rnc,
    String encf,
    boolean secuenciaUtilizada,
    String fechaRecepcion,
    @JsonProperty("mensajes") List<Message> messages) {}
