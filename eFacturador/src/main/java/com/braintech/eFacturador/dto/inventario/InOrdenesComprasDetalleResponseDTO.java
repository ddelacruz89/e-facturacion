package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InOrdenesComprasDetalleResponseDTO {
  private Integer id;
  private Integer productoId;
  private String productoNombre;
  private int cantidad;
  private BigDecimal precioUnitario;
  private BigDecimal itbisProducto;
  private Double descuentoPorciento;
  private Double descuentoCantidad;
  private BigDecimal subTotal;
  private BigDecimal itbis;
  private BigDecimal total;
  private String unidadNombre;
  private Integer unidadCantidad;
  private String estadoId;
}
