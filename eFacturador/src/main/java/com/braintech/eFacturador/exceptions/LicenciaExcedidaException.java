package com.braintech.eFacturador.exceptions;

/** Se lanza cuando una empresa supera el límite de su licencia (usuarios, sucursales, módulos). */
public class LicenciaExcedidaException extends RuntimeException {

  public LicenciaExcedidaException(String message) {
    super(message);
  }
}
