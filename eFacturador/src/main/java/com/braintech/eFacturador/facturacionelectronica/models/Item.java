package com.braintech.eFacturador.facturacionelectronica.models;

import com.braintech.eFacturador.facturacionelectronica.models.subdescuentos.TablaSubDescuento;
import com.braintech.eFacturador.facturacionelectronica.models.subrecargos.TablaSubRecargo;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.beans.Transient;
import java.math.BigDecimal;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Item(
    Integer numeroLinea,
    Integer indicadorFacturacion,
    String nombreItem,
    Integer indicadorBienoServicio,
    BigDecimal cantidadItem,
    String unidadMedida,
    BigDecimal precioUnitarioItem,
    BigDecimal montoItem,
    BigDecimal descuentoMonto,
    BigDecimal recargoMonto,
    Retencion retencion,
    TablaSubDescuento tablaSubDescuento,
    @Transient String numeroCuenta,
    TablaSubRecargo tablaSubRecargo) {}
