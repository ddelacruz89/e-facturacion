package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Encabezado(
    String version, Documento idDoc, Emisor emisor, Comprador comprador, Totales totales) {}
