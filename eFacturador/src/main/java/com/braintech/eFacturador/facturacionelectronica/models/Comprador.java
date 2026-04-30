package com.braintech.eFacturador.facturacionelectronica.models;

import lombok.Builder;

@Builder
public record Comprador(String rncComprador, String razonSocialComprador) {}
