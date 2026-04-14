package com.braintech.eFacturador.enums;

public enum ITipoRetencion {
  ISR("ISR"),
  ITBIS("ITBIS");

  private final String value;

  ITipoRetencion(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
