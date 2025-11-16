package com.braintech.eFacturador.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Anotación para proporcionar descripciones legibles de campos en mensajes de error. */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FieldDescription {
  String value();
}
