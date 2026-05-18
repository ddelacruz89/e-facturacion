package com.braintech.eFacturador.enums;

public enum IndicadorFacturacion {
  NO_FACTURABLE(0),
  ITBIS_1(1),
  ITBIS_2(2),
  ITBIS_3(3),
  EXENTO(4);

  private final int code;

  IndicadorFacturacion(int code) {
    this.code = code;
  }

  public int getCode() {
    return code;
  }
}
