package com.braintech.eFacturador.dto.inventario;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpiDTO {
  private String modulo; // clave interna: "ORDEN_ENTRADA", "ORDEN_COMPRA", etc.
  private String titulo; // texto del card
  private long total; // número principal
  private String labelTotal; // "últimos 7 días", "pendientes", etc.
  private Long pendientes; // métrica secundaria (nullable)
  private String labelPendientes;
  private Long completadas; // métrica terciaria (nullable)
  private String labelCompletadas;
  private List<DashboardTendenciaDTO> tendencia; // 7 puntos diarios
}
