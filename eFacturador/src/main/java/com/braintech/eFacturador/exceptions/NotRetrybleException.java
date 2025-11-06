package com.braintech.eFacturador.exceptions;

public abstract class NotRetrybleException extends RuntimeException {

  public NotRetrybleException(String message) {
    super(message);
  }
}
