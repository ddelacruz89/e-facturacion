package com.braintech.eFacturador.facturacionelectronica.models;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ECFSecuencia(Boolean electronico, String sequence, LocalDate fechaVencimiento) {}
