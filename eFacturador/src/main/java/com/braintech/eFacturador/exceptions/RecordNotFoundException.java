package com.braintech.eFacturador.exceptions;

public class RecordNotFoundException extends NotRetrybleException {

  public RecordNotFoundException(String message) {
    super(message);
  }
}
