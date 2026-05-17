package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Emisor(
    String rncEmisor,
    String razonSocialEmisor,
    String fechaEmision,
    String direccionEmisor,
    String sucursal) {}
