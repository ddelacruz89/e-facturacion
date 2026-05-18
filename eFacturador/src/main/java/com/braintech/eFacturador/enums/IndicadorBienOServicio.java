package com.braintech.eFacturador.enums;

public enum IndicadorBienOServicio {
  BIEN(1),
  SERVICIO(2);

  private final int code;

  IndicadorBienOServicio(int code) {
    this.code = code;
  }

  public int getCode() {
    return code;
  }
}
