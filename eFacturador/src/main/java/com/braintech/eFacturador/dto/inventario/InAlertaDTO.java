package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InAlertaDTO {

  private Integer id;
  private String tipo;

  // Contexto
  private Integer productoId;
  private Integer almacenId;
  private String lote;

  // STOCK_BAJO
  private Integer cantidadActual;
  private Integer limite;

  // VENCIMIENTO
  private LocalDate fechaVencimiento;

  // Auditoría
  private LocalDateTime fechaReg;
  private String usuarioReg;
  private Integer empresaId;
  private Integer sucursalId;

  // Estado de visto por el usuario autenticado
  private boolean visto;
}
