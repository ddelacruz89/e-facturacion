package com.braintech.eFacturador.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class LocalDateZone {

  public static LocalDateTime toLocalDateTime() {
    return LocalDateTime.now(ZoneId.of("America/Santo_Domingo"));
  }

  public static LocalDate toLocalDate() {
    return LocalDate.now(ZoneId.of("America/Santo_Domingo"));
  }
}
