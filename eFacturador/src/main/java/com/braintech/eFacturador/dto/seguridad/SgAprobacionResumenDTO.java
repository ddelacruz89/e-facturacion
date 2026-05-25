package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SgAprobacionResumenDTO {
  private Integer id;
  private String tipoDocumento;
  private Integer documentoId;
  private String solicitanteUsername;
  private String solicitanteNombre;
  private String modoAprobacion;

  /** Estado global: PEN | APR | REC | CAN */
  private String estadoId;

  private LocalDateTime fechaSolicitud;
  private LocalDateTime fechaResolucion;

  /** Cuántos detalles hay en total. */
  private Long totalAprobadores;

  /** Cuántos detalles aún están en PEN. */
  private Long pendientes;
}
