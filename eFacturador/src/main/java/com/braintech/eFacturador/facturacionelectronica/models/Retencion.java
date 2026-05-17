package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Retencion(
    Integer indicadorAgenteRetencionoPercepcion,
    BigDecimal montoITBISRetenido,
    BigDecimal montoISRRetenido) {}
