package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class InOrdenesComprasDetalleRequestDTO {
  private Integer productoId;
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
}
