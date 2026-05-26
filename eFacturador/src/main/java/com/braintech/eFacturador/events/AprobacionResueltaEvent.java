package com.braintech.eFacturador.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AprobacionResueltaEvent extends ApplicationEvent {

  private static final long serialVersionUID = 1L;

  private final String tipoDocumento;
  private final Integer documentoId;
  private final Integer empresaId;
  private final String nuevoEstado; // "APR" | "REC"

  public AprobacionResueltaEvent(
      Object source,
      String tipoDocumento,
      Integer documentoId,
      Integer empresaId,
      String nuevoEstado) {
    super(source);
    this.tipoDocumento = tipoDocumento;
    this.documentoId = documentoId;
    this.empresaId = empresaId;
    this.nuevoEstado = nuevoEstado;
  }
}
