package com.braintech.eFacturador.dto.notificacion;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SgNotificacionDTO {

  private Integer id;
  private Integer empresaId;
  private Integer sucursalId;

  private String modulo;
  private String tipo;
  private String titulo;
  private String descripcion;

  private Integer referenciaId;
  private String referenciaTipo;

  private Map<String, Object> payload;

  private String estadoId;
  private LocalDateTime fechaReg;
  private String usuarioReg;

  /** True si el usuario autenticado ya marcó esta notificación como vista. */
  private boolean visto;
}
