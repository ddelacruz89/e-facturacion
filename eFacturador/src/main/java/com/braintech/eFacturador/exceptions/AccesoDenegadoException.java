package com.braintech.eFacturador.exceptions;

/** Se lanza cuando el usuario no tiene el permiso requerido para ejecutar la operación. */
public class AccesoDenegadoException extends RuntimeException {

  public AccesoDenegadoException(String message) {
    super(message);
  }
}
