package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de resumen para el listado/búsqueda de movimientos de inventario. Solo contiene los campos
 * necesarios para mostrar en tabla; nunca objetos anidados.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InMovimientoResumenDTO {
  private Integer id;
  private LocalDateTime fechaReg;
  private Integer tipoMovimientoId;
  private Integer numeroReferencia;
  private Integer almacenId;
  private Integer productoId;
  private String productoNombre;
  private String lote;
  private Integer cantidad;
  private Integer cantidadInventario;
  private BigDecimal precioUnitario;
  private BigDecimal costoTotal;
  private String usuarioReg;
  private String observacion;
}
