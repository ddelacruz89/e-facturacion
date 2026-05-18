package com.braintech.eFacturador.enums;

public enum TipoAjusteType {
  D,
  R;

  public String value() {
    return name();
  }

  public static TipoAjusteType fromValue(String v) {
    return valueOf(v);
  }
}
