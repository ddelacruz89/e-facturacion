package com.braintech.eFacturador.exceptions;

public class ApplicationException extends NotRetrybleException {

  public ApplicationException(String message) {
    super(message);
  }
}
