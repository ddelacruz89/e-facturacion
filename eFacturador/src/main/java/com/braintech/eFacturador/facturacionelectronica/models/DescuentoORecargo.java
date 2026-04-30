package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.math.BigInteger;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record DescuentoORecargo(
    Integer numeroLinea,
    TipoAjusteType tipoAjuste,
    BigInteger indicadorNorma1007,
    String descripcionDescuentooRecargo,
    String tipoValor,
    Double valorDescuentooRecargo,
    BigDecimal montoDescuentooRecargo,
    Double montoDescuentooRecargoOtraMoneda,
    Integer indicadorFacturacionDescuentooRecargo) {}
