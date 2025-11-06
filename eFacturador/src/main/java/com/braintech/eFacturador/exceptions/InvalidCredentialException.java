package com.braintech.eFacturador.exceptions;

public class InvalidCredentialException extends NotRetrybleException {

  public InvalidCredentialException(String message) {
    super(message);
  }
}
