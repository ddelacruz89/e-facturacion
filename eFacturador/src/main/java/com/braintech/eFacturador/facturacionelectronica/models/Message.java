package com.braintech.eFacturador.facturacionelectronica.models;

import lombok.Builder;

@Builder
public record Message(String valor, String codigo) {}
