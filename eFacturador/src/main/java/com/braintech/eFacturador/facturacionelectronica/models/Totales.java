package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Totales(
    BigDecimal montoGravadoTotal,
    BigDecimal montoGravadoI1,
    BigDecimal montoGravadoI2,
    BigDecimal montoGravadoI3,
    BigDecimal montoExento,
    BigDecimal montoNoFacturable,
    Integer itbis1,
    Integer itbis2,
    Integer itbis3,
    BigDecimal totalITBIS,
    BigDecimal totalITBIS1,
    BigDecimal totalITBIS2,
    BigDecimal totalITBIS3,
    BigDecimal montoTotal,
    BigDecimal totalITBISRetenido,
    BigDecimal totalISRRetencion) {}
