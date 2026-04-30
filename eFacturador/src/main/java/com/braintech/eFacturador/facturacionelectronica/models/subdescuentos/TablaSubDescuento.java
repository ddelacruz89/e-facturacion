package com.braintech.eFacturador.facturacionelectronica.models.subdescuentos;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TablaSubDescuento(List<SubDescuento> subDescuento) {}
