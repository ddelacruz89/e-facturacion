package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InRequisicionResumenDTO {
  private Integer id;
  private Integer secuencia;
  private LocalDateTime fechaReg;
  private String almacenSolicitanteNombre;
  private String almacenOrigenNombre;
  private String prioridad;
  private String usuarioReg;
  private String estadoId;
}
