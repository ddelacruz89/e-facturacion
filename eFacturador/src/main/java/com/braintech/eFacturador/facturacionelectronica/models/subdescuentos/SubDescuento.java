package com.braintech.eFacturador.facturacionelectronica.models.subdescuentos;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SubDescuento(
    String tipoSubDescuento, BigDecimal subDescuentoPorcentaje, BigDecimal montoSubDescuento) {}
