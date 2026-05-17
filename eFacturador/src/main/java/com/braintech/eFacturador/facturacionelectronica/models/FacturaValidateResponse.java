package com.braintech.eFacturador.facturacionelectronica.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.Builder;

@Builder
@JsonInclude(content = JsonInclude.Include.NON_NULL)
public record FacturaValidateResponse(
    String trackingNumber,
    String securityCode,
    String fechaFirma,
    String qrUrl,
    String status,
    String description,
    List<String> errorList,
    String requestUrl,
    String requestType) {
  @Override
  public String trackingNumber() {
    return trackingNumber != null ? trackingNumber : "";
  }
}
