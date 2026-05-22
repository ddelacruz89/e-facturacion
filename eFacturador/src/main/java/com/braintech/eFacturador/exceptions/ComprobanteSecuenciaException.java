package com.braintech.eFacturador.exceptions;

public class ComprobanteSecuenciaException extends RuntimeException {

  public enum Motivo {
    FECHA_EXPIRADA,
    COMPROBANTES_AGOTADOS
  }

  private final Motivo motivo;

  public ComprobanteSecuenciaException(Motivo motivo, String message) {
    super(message);
    this.motivo = motivo;
  }

  public Motivo getMotivo() {
    return motivo;
  }
}
