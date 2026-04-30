package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Documento(
    String tipoeCF,
    String encf,
    String fechaVencimientoSecuencia,
    String fechaLimitePago,
    Integer indicadorMontoGravado,
    Integer indicadorNotaCredito,
    String tipoIngresos,
    Integer tipoPago) {}
