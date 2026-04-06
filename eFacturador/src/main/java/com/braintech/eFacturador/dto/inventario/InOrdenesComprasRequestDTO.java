package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class InOrdenesComprasRequestDTO {
  private BigDecimal subTotal;
  private BigDecimal itbis;
  private BigDecimal total;
  private BigDecimal descuento;
  private Integer suplidorId;
  private String estadoId;
  private Integer cotizacionId;
  private List<InOrdenesComprasDetalleRequestDTO> detalles;
}
