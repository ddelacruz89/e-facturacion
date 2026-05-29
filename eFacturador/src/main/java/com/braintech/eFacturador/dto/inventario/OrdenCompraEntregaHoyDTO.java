package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Resumen de una orden de compra con entrega tentativa para hoy. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenCompraEntregaHoyDTO {
  private Integer id;
  private String suplidorNombre;
  private BigDecimal total;
  private String estadoId;
  private LocalDateTime fechaReg;
}
